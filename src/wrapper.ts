import {
  IAWSLambaContext,
  IAwsLambdaEvent,
  IAWSLambdaProxyIntegrationRequest
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
  getHeaders,
  getContentType,
  CORS_HEADERS
} from "./wrapper/headers";

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
  ): Promise<O | string> {
    let workflowStatus:
      | "initializing"
      | "running-function"
      | "function-complete"
      | "invoke-complete"
      | "invoke-started"
      | "sequence-defined"
      | "sequence-started"
      | "completing" = "initializing";

    const log = logger().lambda(event, context);
    const errorMeta: ErrorMeta = new ErrorMeta();
    try {
      context.callbackWaitsForEmptyEventLoop = false;
      const { request, sequence, apiGateway } = LambdaSequence.from(event);
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
        errorMeta: errorMeta
      };
      workflowStatus = "running-function";

      // CALL the HANDLER FUNCTION
      const results = await fn(request, handlerContext);

      workflowStatus = "function-complete";

      // SEQUENCE (continuation)
      if (sequence.isSequence && !sequence.isDone) {
        workflowStatus = "invoke-started";
        await invoke(...sequence.next(results));
        workflowStatus = "invoke-complete";
      }

      // SEQUENCE (orchestration starting)
      await invokeNewSequence(results, log);

      // RETURN
      if (handlerContext.isApiGatewayRequest) {
        const headers = {
          ...CORS_HEADERS,
          ...getHeaders(),
          "Content-Type": getContentType()
        };
        const response = {
          statusCode: 200,
          headers,
          body: JSON.stringify(results)
        };
        log.debug(`Returning results to API Gateway`, {
          statusCode: 200,
          results
        });
        return response as any;
      } else {
        log.debug(`Returning results to non-API Gateway caller`, { results });
        return results;
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
              return HandledError.apiGatewayError(
                found.code,
                e,
                log.getContext()
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
        log.warn(
          `The error in "${context.functionName}" has been returned to API Gateway using the default handler`,
          { error: e, workflowStatus }
        );
        if (isApiGatewayRequest) {
          // API Gateway structured error
          // TODO: can this be thrown instead so we don't need to use "any"?
          throw UnhandledError.apiGatewayError(
            errorMeta.defaultErrorCode,
            e,
            context.awsRequestId
          );
        } else {
          throw new UnhandledError(
            errorMeta.defaultErrorCode,
            e,
            context.awsRequestId
          );
        }
      }
    }
  };
};
