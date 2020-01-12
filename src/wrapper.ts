import {
  IAWSLambaContext,
  isLambdaProxyRequest,
  IApiGatewayResponse,
  IApiGatewayErrorResponse,
  HttpStatusCodes
} from "common-types";
import { logger } from "aws-log";
import { ErrorMeta } from "./errors/ErrorMeta";
import { LambdaSequence } from "./LambdaSequence";
import { UnhandledError } from "./errors/UnhandledError";
import {
  IHandlerContext,
  IWrapperOptions,
  IOrchestrationRequestTypes
} from "./@types";
import { HandledError } from "./errors/HandledError";
import {
  registerSequence as register,
  invokeNewSequence,
  findError,
  getSecrets,
  database,
  setFnHeaders,
  setContentType,
  getResponseHeaders,
  saveSecretHeaders,
  loggedMessages,
  getNewSequence,
  maskLoggingForSecrets,
  getLocalSecrets
} from "./wrapper-fn/index";
import {
  convertToApiGatewayError,
  ErrorWithinError,
  RethrowError
} from "./errors/index";
import { sequenceStatus, buildOrchestratedRequest } from "./sequences/index";
import { invoke } from "./invoke";
import { ISequenceTrackerStatus } from "./exported-functions/SequenceTracker";
import get from "lodash.get";

/**
 * **wrapper**
 *
 * A higher order function which wraps a serverless _handler_-function with the aim of providing
 * a better typing, logging, and orchestration experience.
 *
 * @param req a strongly typed request object that is defined by the `<I>` generic
 * @param context the contextual props and functions which AWS provides plus additional
 * features brought in by the wrapper function
 */
export const wrapper = function<I, O>(
  fn: (req: I, context: IHandlerContext) => Promise<O>,
  options: IWrapperOptions = {}
) {
  /** this is the core Lambda event which the wrapper takes as an input */
  return async function(
    event: IOrchestrationRequestTypes<I>,
    context: IAWSLambaContext
  ): Promise<O | IApiGatewayResponse | IApiGatewayErrorResponse> {
    let result: O;
    let workflowStatus:
      | "initializing"
      | "starting-try-catch"
      | "prep-starting"
      | "running-function"
      | "function-complete"
      | "invoke-complete"
      | "invoke-started"
      | "sequence-defined"
      | "sequence-starting"
      | "sequence-started"
      | "sequence-tracker-starting"
      | "completing"
      | "returning-values";
    workflowStatus = "initializing";
    context.callbackWaitsForEmptyEventLoop = false;
    const log = logger().lambda(event, context);
    const msg = loggedMessages(log);
    const errorMeta: ErrorMeta = new ErrorMeta();
    try {
      workflowStatus = "starting-try-catch";
      const { request, sequence, apiGateway, headers } = LambdaSequence.from<I>(
        event
      );
      msg.start(request, headers, context, sequence, apiGateway);
      saveSecretHeaders(headers, log);
      maskLoggingForSecrets(getLocalSecrets(), log);

      //#region PREP
      workflowStatus = "prep-starting";
      const status = sequenceStatus(log.getCorrelationId());
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
        getSecrets,
        isApiGatewayRequest: isLambdaProxyRequest(event),
        errorMgmt: errorMeta,
        invoke
      };
      //#endregion

      //#region CALL the HANDLER FUNCTION
      workflowStatus = "running-function";
      result = await fn(request, handlerContext);

      log.debug(`handler function returned to wrapper function`, { result });
      workflowStatus = "function-complete";
      //#endregion

      //#region SEQUENCE (next)
      if (sequence.isSequence && !sequence.isDone) {
        workflowStatus = "invoke-started";
        const [fn, requestBody] = sequence.next<O>(result);
        msg.startingInvocation(fn, requestBody);
        const invokeParams = await invoke(fn, requestBody);
        msg.completingInvocation(fn, invokeParams);
        workflowStatus = "invoke-complete";
      } else {
        msg.notPartOfExistingSequence();
      }
      //#endregion

      //#region SEQUENCE (orchestration starting)
      if (getNewSequence().isSequence) {
        workflowStatus = "sequence-starting";
        msg.sequenceStarting();
        const seqResponse = await invokeNewSequence(result);
        msg.sequenceStarted(seqResponse);
        workflowStatus = "sequence-started";
      } else {
        msg.notPartOfNewSequence();
      }
      //#endregion

      //#region SEQUENCE (send to tracker)
      if (options.sequenceTracker && sequence.isSequence) {
        workflowStatus = "sequence-tracker-starting";
        msg.sequenceTracker(options.sequenceTracker, workflowStatus);
        await invoke(
          options.sequenceTracker,
          buildOrchestratedRequest<ISequenceTrackerStatus>(status(sequence))
        );
        if (sequence.isDone) {
          msg.sequenceTrackerComplete(true);
        } else {
          msg.sequenceTrackerComplete(false);
        }
      }
      //#endregion

      //#region RETURN-VALUES
      workflowStatus = "returning-values";
      if (handlerContext.isApiGatewayRequest) {
        const response: IApiGatewayResponse = {
          statusCode: HttpStatusCodes.Success,
          headers: getResponseHeaders(),
          body: typeof result === "string" ? result : JSON.stringify(result)
        };
        msg.returnToApiGateway(result, getResponseHeaders());
        return response;
      } else {
        log.debug(`Returning results to non-API Gateway caller`, { result });
        return result;
      }
      //#endregion
    } catch (e) {
      //#region ERROR-HANDLING
      // wrap all error handling in it's own try-catch
      try {
        msg.processingError(e, workflowStatus);

        const found = findError(e, errorMeta);
        const isApiGatewayRequest: boolean = isLambdaProxyRequest(event);

        if (found) {
          if (found.handling.callback) {
            const resolved = found.handling.callback(e);
            if (!resolved) {
              if (isApiGatewayRequest) {
                return convertToApiGatewayError(
                  new HandledError(found.code, e, log.getContext())
                );
              } else {
                console.log(e.name, e.code);

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
          //#region UNFOUND ERROR
          log.debug(
            `An error is being processed by the default handling mechanism`,
            {
              defaultHandling: get(errorMeta, "defaultHandling"),
              errorMessage: get(e, "message", "no error messsage"),
              stack: get(e, "stack", "no stack available")
            }
          );
          //#endregion

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
                    `The error was fully handled by the handling function/callback; resulting in a successful condition [ ${
                      result
                        ? HttpStatusCodes.Success
                        : HttpStatusCodes.NoContent
                    } ].`
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
              /**
               * This handles situations where the user stated that if an
               * "unknown" error occurred that _this_ error should be thrown
               * in it's place.
               */
              handling.error.message = handling.error.message || e.message;
              handling.error.stack = e.stack;
              handling.error.type = "default-error";
              if (isApiGatewayRequest) {
                return convertToApiGatewayError(handling.error);
              } else {
                throw handling.error;
              }
              break;
            //#endregion

            case "default":
              //#region default
              log.debug(`Error handled by default policy`, {
                code: errorMeta.defaultErrorCode,
                message: e.message,
                stack: e.stack
              });
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
      } catch (eOfE) {
        // Catch errors in error handlers
        if (
          eOfE.type === "unhandled-error" ||
          eOfE.type === "handled-error" ||
          eOfE.type === "default-error"
        ) {
          throw new RethrowError(eOfE);
        }
        throw new ErrorWithinError(e, eOfE);
      }
    }
  };
  //#endregion
};
