import {
  IAWSLambaContext,
  IAwsLambdaEvent,
  IAWSLambdaProxyIntegrationRequest,
  IDictionary
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
      if (
        results instanceof LambdaSequence ||
        (typeof results === "object" &&
          ((results as IDictionary).sequence instanceof LambdaSequence ||
            (results as IDictionary)._sequence instanceof LambdaSequence))
      ) {
        workflowStatus = "sequence-defined";
        const sequence: LambdaSequence =
          results instanceof LambdaSequence
            ? results
            : (results as IDictionary)._sequence ||
              (results as IDictionary).sequence;
        const location =
          results instanceof LambdaSequence
            ? "root"
            : (results as IDictionary)._sequence
            ? "_sequence"
            : "sequence";
        log.info(
          `This function has started a sequence [ prop: ${location} ]! There are ${sequence.steps.length} steps in this sequence.`,
          { sequence }
        );
        if (location === "_sequence") {
          delete (results as IDictionary)._sequence;
        } else if (location === "sequence") {
          delete (results as IDictionary).sequence;
        }
        await invoke(
          ...sequence.next(location === "root" ? undefined : results)
        );
        workflowStatus = "sequence-started";
      }

      // RETURN
      if (handlerContext.isApiGatewayRequest) {
        const response = {
          statusCode: 200,
          body: JSON.stringify(results)
        };
        log.debug(`Returning results to API Gateway`, {
          statusCode: 200,
          results
        });
        return JSON.stringify(response);
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
