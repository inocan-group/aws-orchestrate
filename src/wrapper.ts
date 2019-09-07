import {
  IAWSLambaContext,
  IAwsLambdaEvent,
  IAWSLambdaProxyIntegrationRequest,
  IApiGatewayErrorResponse,
  HttpStatusCodes,
  IApiGatewayResponse
} from "common-types";
import { logger, invoke } from "aws-log";
import { ErrorMeta } from "./errors/ErrorMeta";
import { LambdaSequence } from "./LambdaSequence";
import { UnhandledError } from "./errors/UnhandledError";
import { findError } from "./wrapper/findError";
import { IHandlerContext } from "./@types";
import { HandledError } from "./errors/HandledError";
import { getSecrets } from "./wrapper/getSecrets";
import { database } from "./database-connect";
import {
  startSequence as start,
  invokeNewSequence
} from "./wrapper/startSequence";
import {
  setHeaders,
  setContentType,
  setCorrelationId,
  getAllHeaders
} from "./wrapper/headers";
import { convertToApiGatewayError } from "./errors";

/**
 * **wrapper**
 *
 * A higher order function which wraps a serverless _handler_-function with the aim of providing
 * a better typing, logging, and orchestration experience.
 *
 * @param event will be either the body of the request or the hash passed in by API Gateway
 * @param context the contextual props and functions which AWS provides
 */
export const wrapper = function<I, O>(
  fn: (event: I, context: IHandlerContext<I>) => Promise<O>
) {
  return async function(
    event: IAwsLambdaEvent<I>,
    context: IAWSLambaContext
  ): Promise<O | IApiGatewayResponse | IApiGatewayErrorResponse> {
    let result: O;
    let workflowStatus:
      | "initializing"
      | "running-function"
      | "function-complete"
      | "invoke-complete"
      | "invoke-started"
      | "sequence-defined"
      | "sequence-started"
      | "completing" = "initializing";

    context.callbackWaitsForEmptyEventLoop = false;
    const log = logger().lambda(event, context);
    const errorMeta: ErrorMeta = new ErrorMeta();
    try {
      const { request, sequence, apiGateway } = LambdaSequence.from(event);
      setCorrelationId(log.getCorrelationId());
      log.info(
        `The handler function "${
          context.functionName
        }" has started execution.  ${
          sequence.isSequence
            ? `This handler is part of a sequence [${log.getCorrelationId()} ].`
            : "This handler was not triggered as part of a sequence."
        }`,
        {
          clientContext: context.clientContext,
          request,
          sequence,
          apiGateway
        }
      );
      const startSequence = start(log, context);
      const handlerContext: IHandlerContext<I> = {
        ...context,
        log,
        setHeaders,
        setContentType,
        database,
        sequence,
        startSequence,
        isSequence: sequence.isSequence,
        isDone: sequence.isDone,
        apiGateway,
        getSecrets: getSecrets(request),
        isApiGatewayRequest: apiGateway && apiGateway.headers ? true : false,
        errorMgmt: errorMeta
      };
      workflowStatus = "running-function";
      // CALL the HANDLER FUNCTION
      result = await fn(request, handlerContext);

      workflowStatus = "function-complete";

      // SEQUENCE (continuation)
      if (sequence.isSequence && !sequence.isDone) {
        workflowStatus = "invoke-started";
        await invoke(...sequence.next(result));
        workflowStatus = "invoke-complete";
      }

      // SEQUENCE (orchestration starting)
      await invokeNewSequence(result, log);

      // RETURN
      const headers = getAllHeaders();
      if (handlerContext.isApiGatewayRequest) {
        const response: IApiGatewayResponse = {
          statusCode: HttpStatusCodes.Success,
          headers,
          body: JSON.stringify(result)
        };
        log.debug(`Returning results to API Gateway`, {
          statusCode: 200,
          headers,
          result
        });
        return response;
      } else {
        log.debug(`Returning results to non-API Gateway caller`, { result });
        return result;
      }
      // END of RETURN BLOCK
    } catch (e) {
      log.info(`Processing error in handler function: ${e.message}`, {
        error: e,
        workflowStatus
      });
      const found = findError(e, errorMeta);
      const isApiGatewayRequest: boolean =
        typeof event === "object" &&
        (event as IAWSLambdaProxyIntegrationRequest).headers
          ? true
          : false;

      if (found) {
        if (found.handling.callback) {
          const resolved = found.handling.callback(e);
          if (!resolved) {
            if (isApiGatewayRequest) {
              return convertToApiGatewayError(
                new HandledError(found.code, e, log.getContext())
              );
            } else {
              throw new HandledError(found.code, e, log.getContext());
            }
          }
        }

        if (found.handling.forwardTo) {
          await invoke(found.handling.forwardTo, e);
          log.info(
            `Forwarded error to the function "${found.handling.forwardTo}"`,
            { error: e, forwardTo: found.handling.forwardTo }
          );
        }
      } else {
        // UNFOUND ERROR
        log.debug(
          `An unfound error is being processed by the default handling mechanism`,
          {
            defaultHandling: errorMeta.defaultHandling,
            errorMessage: e.message,
            stack: e.stack
          }
        );
        const handling = errorMeta.defaultHandling;
        switch (handling.type) {
          case "handler-fn":
            //#region handle-fn
            /**
             * results are broadly three things:
             *
             * 1. handler throws an error
             * 2. handler returns `true` which means that result should be considered successful
             * 3. handler returns _falsy_ which means that the default error should be thrown
             */
            try {
              const passed = handling.defaultHandlerFn(e);
              if (passed === true) {
                log.debug(
                  `The error was fully handled by the handling function/callback; resulting in a successful condition.`
                );
                if (isApiGatewayRequest) {
                  return {
                    statusCode: result
                      ? HttpStatusCodes.Success
                      : HttpStatusCodes.NoContent,
                    headers: getAllHeaders(),
                    body: result ? JSON.stringify(result) : ""
                  };
                } else {
                  return result;
                }
              } else {
                log.debug(
                  `The error was passed to the callback/handler function but it did NOT resolve the error condition.`
                );
              }
            } catch (e2) {
              // handler threw an error
              log.debug(`the handler function threw an error: ${e2.message}`, {
                messsage: e2.message,
                stack: e2.stack
              });
              if (isApiGatewayRequest) {
                return convertToApiGatewayError(
                  new UnhandledError(errorMeta.defaultErrorCode, e)
                );
              }
            }
            break;
          //#endregion

          case "error-forwarding":
            //#region error-forwarding
            log.debug(
              "The error will be forwarded to another function for handling",
              { arn: handling.arn }
            );
            await invoke(handling.arn, e);
            break;
          //#endregion

          case "default-error":
            //#region default-error
            handling.error.message = handling.error.message || e.message;
            handling.error.stack = e.stack;
            if (isApiGatewayRequest) {
              return convertToApiGatewayError(handling.error);
            } else {
              throw handling.error;
            }
            break;
          //#endregion

          case "default":
            //#region default
            log.debug(`Error handled by default unknown policy`);
            if (isApiGatewayRequest) {
              return convertToApiGatewayError(
                new UnhandledError(errorMeta.defaultErrorCode, e)
              );
            } else {
              throw new UnhandledError(errorMeta.defaultErrorCode, e);
            }
            break;
          //#endregion

          default:
            log.debug("Unknown handling technique for unhandled error", {
              type: (handling as any).type,
              errorMessage: e.message
            });
            throw new UnhandledError(errorMeta.defaultErrorCode, e);
        }
      }
    }
  };
};
