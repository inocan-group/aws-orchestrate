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

export const DEFAULT_ERROR_CODE = 500;

/**
 * **handler**
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
      | "completing" = "initializing";
    const log = logger().lambda(event, context);
    const errorMeta: ErrorMeta = new ErrorMeta();
    try {
      context.callbackWaitsForEmptyEventLoop = false;
      const { request, sequence, apiGateway } = LambdaSequence.from(event);
      log.info(
        `The handler function "${context.functionName}" has started execution`,
        {
          clientContext: context.clientContext,
          request,
          sequence,
          apiGateway
        }
      );
      const handlerContext: IHandlerContext<I> = {
        ...context,
        log,
        database,
        sequence,
        isSequence: sequence.isSequence,
        isDone: sequence.isDone,
        apiGateway,
        getSecrets: getSecrets(request),
        isApiGatewayRequest: apiGateway && apiGateway.headers ? true : false,
        errorMeta: errorMeta
      };
      workflowStatus = "running-function";
      const results = await fn(request, handlerContext);
      workflowStatus = "function-complete";

      // SEQUENCE
      if (sequence.isSequence && !sequence.isDone) {
        workflowStatus = "invoke-started";
        await invoke(...sequence.next(results));
        workflowStatus = "invoke-complete";
      }

      // RETURN
      if (handlerContext.isApiGatewayRequest) {
        return JSON.stringify({
          statusCode: 200,
          data: results
        });
      } else {
        return results;
      }
    } catch (e) {
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
          `The error in ${
            context.functionName
          } has been returned to API Gateway using the default handler`,
          { error: e }
        );
        if (isApiGatewayRequest) {
          return UnhandledError.apiGatewayError(
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
