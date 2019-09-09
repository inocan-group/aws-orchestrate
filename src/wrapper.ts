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
import { IHandlerContext, IWrapperOptions } from "./@types";
import { HandledError } from "./errors/HandledError";
import {
  registerSequence as register,
  invokeNewSequence,
  findError,
  getSecrets,
  getSecret,
  database,
  setFnHeaders,
  setContentType,
  getResponseHeaders,
  setCorrelationId,
  saveSecretHeaders,
  loggedMessages,
  getNewSequence,
  maskLoggingForSecrets,
  getLocalSecrets
} from "./wrapper-fn/index";
import { convertToApiGatewayError } from "./errors";
import { sequenceStatus } from "./sequences";

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
  fn: (event: I, context: IHandlerContext<I>) => Promise<O>,
  options: IWrapperOptions = {}
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
      | "sequence-starting"
      | "sequence-started"
      | "sequence-tracker-starting"
      | "completing"
      | "returning-values"
      | "initializing";

    context.callbackWaitsForEmptyEventLoop = false;
    const log = logger().lambda(event, context);
    const msg = loggedMessages(log);
    setCorrelationId(log.getCorrelationId());
    const errorMeta: ErrorMeta = new ErrorMeta();

    try {
      const status = sequenceStatus(log.getCorrelationId());
      const { request, sequence, apiGateway, headers } = LambdaSequence.from(
        event
      );
      saveSecretHeaders(headers);
      maskLoggingForSecrets(getLocalSecrets(), log);
      msg.start(request, headers, context, sequence, apiGateway);

      //#region PREP
      const registerSequence = register(log, context);
      const handlerContext: IHandlerContext<I> = {
        ...context,
        log,
        headers,
        setHeaders: setFnHeaders,
        setContentType,
        database,
        sequence,
        registerSequence,
        isSequence: sequence.isSequence,
        isDone: sequence.isDone,
        apiGateway,
        getSecret,
        getSecrets,
        isApiGatewayRequest: apiGateway && apiGateway.resource ? true : false,
        errorMgmt: errorMeta
      };
      //#endregion

      //#region CALL the HANDLER FUNCTION
      workflowStatus = "running-function";
      result = await fn(request, handlerContext);
      log.debug(`finished calling the handler function`, { result });
      workflowStatus = "function-complete";
      //#endregion

      //region SEQUENCE (next)
      if (sequence.isSequence && !sequence.isDone) {
        workflowStatus = "invoke-started";
        await invoke(...sequence.next(result));
        log.debug(`finished invoking the next function in the sequence`, {
          sequence
        });
        workflowStatus = "invoke-complete";
      }
      //#endregion

      //#region SEQUENCE (orchestration starting)
      workflowStatus = "sequence-starting";
      msg.sequenceStarting();
      const seqResponse = await invokeNewSequence(result, log);
      msg.sequenceStarted(seqResponse);
      log.debug(`kicked off the new sequence defined in this function`, {
        sequence: getNewSequence()
      });
      workflowStatus = "sequence-started";
      //#endregion

      //#region SEQUENCE (send to tracker)
      if (options.sequenceTracker || sequence.isSequence) {
        workflowStatus = "sequence-tracker-starting";
        msg.sequenceTracker(options.sequenceTracker, workflowStatus);
        if (sequence.isDone) {
          await invoke(options.sequenceTracker, status(sequence), result);
        } else {
          await invoke(options.sequenceTracker, status(sequence));
        }
      }
      //#endregion

      //#region RETURN-VALUES
      workflowStatus = "returning-values";

      if (handlerContext.isApiGatewayRequest) {
        const response: IApiGatewayResponse = {
          statusCode: HttpStatusCodes.Success,
          headers: getResponseHeaders(),
          body: JSON.stringify(result)
        };
        msg.returnToApiGateway(result, getResponseHeaders());
        return response;
      } else {
        log.debug(`Returning results to non-API Gateway caller`, { result });
        return result;
      }
      //#endregion
    } catch (e) {
      msg.processingError(e, workflowStatus);

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
                    headers: getResponseHeaders(),
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
