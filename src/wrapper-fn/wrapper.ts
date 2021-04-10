/* eslint-disable no-case-declarations */
import {
  HttpStatusCodes,
  IDictionary,
  isLambdaProxyRequest,
  epochWithMilliseconds,
  scalar,
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaContext,
  IAwsApiGatewayResponse,
} from "common-types";

import { logger } from "aws-log";
import {
  ErrorMeta,
  ErrorHandler,
  ServerlessError,
  HandledError,
  convertToApiGatewayError,
  UnhandledError,
  RethrowError,
  ErrorWithinError,
} from "~/errors";

import { IWrapperContext, IWrapperOptions, OrchestratedErrorForwarder, WorkflowStatus } from "~/types";

import {
  loggedMessages,
  setSecretHeaders,
  maskLoggingForSecrets,
  getLocalSecrets,
  setUserHeaders,
  getResponseHeaders,
  findError,
  getSecrets,
  setContentType,
} from "~/wrapper-fn";
import { invoke } from "~/invoke";
import { extractRequestState } from "./extractRequestState";

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
export const wrapper = function <I, O extends any, Q extends IDictionary<scalar>, P extends IDictionary<scalar>>(
  fn: (request: I, context: IWrapperContext<Q, P>) => Promise<O>,
  options: IWrapperOptions = {}
) {
  /** this is the core Lambda event which the wrapper takes as an input */
  return async function (
    event: I | IAwsLambdaProxyIntegrationRequest,
    context: IAwsLambdaContext
  ): Promise<O | IAwsApiGatewayResponse> {
    let workflowStatus = WorkflowStatus.initializing;
    const t0: epochWithMilliseconds = Date.now();
    const log = logger(options.loggerConfig).lambda(event, context);
    const correlationId = log.getCorrelationId();
    log.info("Starting Lambda Handler", { event, context });

    const state = extractRequestState<I, Q, P>(event);
    let response: O = Symbol("Not Yet Defined") as O;
    context.callbackWaitsForEmptyEventLoop = false;
    const message = loggedMessages(log);
    const errorMeta: ErrorMeta = new ErrorMeta();
    /** the code to use for successful requests */
    let statusCode = 0;
    let handlerContext: IWrapperContext<Q, P> = {} as IWrapperContext<Q, P>;

    // #region PREP

    // catch all error prior to handing off to handler function
    try {
      if (state.headers) {
        setSecretHeaders(state.headers, log);
        maskLoggingForSecrets(getLocalSecrets(), log);
      }

      handlerContext = {
        ...context,
        // function interface
        log,
        getSecrets,
        setSuccessCode: (code: number) => (statusCode = code),
        errorMgmt: errorMeta,
        invoke,
        setHeaders: setUserHeaders,
        setContentType,

        // additonal props
        correlationId,
        headers: state.headers || {},
        token: state.token,
        isApiGatewayRequest: state.isApiGateway,
        caller: state.caller,

        // API-Gateway only props
        ...(state.isApiGateway
          ? {
              queryParameters: state.query,
              pathParameters: state.path,
              verb: state.verb,
              claims: state.claims,
              identity: state.identity,
              apiGateway: state.apiGateway,
            }
          : {}),
      };
    } catch (prepError) {
      // TODO: implement
    }
    // #endregion

    // #region HANDLER FN
    workflowStatus = WorkflowStatus.handlerRunning;
    const t1 = Date.now();
    try {
      response = await fn(state.request, handlerContext);
      workflowStatus = WorkflowStatus.handlerComplete;
    } catch (stepFnError) {
      workflowStatus = WorkflowStatus.handlerComplete;
      log.warn(`Error encountered executing handler: ${stepFnError.message}`, {
        error: stepFnError,
        prepTime: t1 - t0,
      });
      // TODO: complete
    }

    // #endregion

    // #region CLOSE OUT
    try {
      if (handlerContext.isApiGatewayRequest) {
        // API-GATEWAY Response
        const res: IAwsApiGatewayResponse = {
          statusCode: statusCode ? statusCode : response ? HttpStatusCodes.Success : HttpStatusCodes.NoContent,
          headers: getResponseHeaders() as IDictionary,
          body: response ? (typeof response === "string" ? response : JSON.stringify(response)) : "",
        };
        message.returnToApiGateway(response, getResponseHeaders());
        return res;
      } else {
        // NON API-GATEWAY Response
        const t2 = Date.now();
        log.info("Successful completion of handler", { response, duration: t2 - t0, prepTime: t1 - t0 });
        return response;
      }

      // #endregion
    } catch (error) {
      console.log(`Error encountered: ${error.message}`, { error: error });
      // #region ERROR-HANDLING
      // wrap all error handling in it's own try-catch
      try {
        const isApiGatewayRequest: boolean = isLambdaProxyRequest(apiGateway);
        message.processingError(error, workflowStatus, isApiGatewayRequest);

        /**
         * "found" is either handler author using the `HandledError` class themselves
         * or using the API exposed at `context.errorMgmt`
         **/
        const found: ServerlessError | ErrorHandler | false =
          error instanceof ServerlessError ? error : findError(error, errorMeta);
        if (found instanceof ServerlessError) {
          found.functionName = context.functionName;
          found.classification = found.classification.replace("aws-orchestrate/", `${found.functionName}/`);
          found.correlationId = handlerContext.correlationId;
          found.awsRequestId = handlerContext.awsRequestId;

          throw found;
        }

        if (found) {
          if (!found.handling) {
            const error_ = new HandledError(found.code, error, log.getContext());
            if (isApiGatewayRequest) {
              return convertToApiGatewayError(error_);
            } else {
              throw error_;
            }
          }
          if (found.handling && found.handling.callback) {
            const resolvedLocally = found.handling.callback(error);
            if (!resolvedLocally) {
              // Unresolved Known Error!

              if (isApiGatewayRequest) {
                return convertToApiGatewayError(new HandledError(found.code, error, log.getContext()));
              } else {
                throw new HandledError(found.code, error, log.getContext());
              }
            } else {
              // Known Error was resolved
              log.info("There was an error which was resolved by a locally defined error handler", { error: error });
            }
          }

          if (found.handling && found.handling.forwardTo) {
            log.info(`Forwarding error to the function "${found.handling.forwardTo}"`, {
              error: error,
              forwardTo: found.handling.forwardTo,
            });
            await invokeLambda(found.handling.forwardTo, error);
          }
        } else {
          // #region UNFOUND ERROR
          log.debug("An error is being processed by the default handling mechanism", {
            defaultHandling: errorMeta.defaultHandling,
            errorMessage: error.message ?? "no error messsage",
            stack: error.stack ?? "no stack available",
          });
          // #endregion
          const errorPayload = { ...error, name: error.name, message: error.message, stack: error.stack };
          const handling = errorMeta.defaultHandling;
          switch (handling.type) {
            case "handler-fn":
              // #region handle-fn
              /**
               * results are broadly three things:
               *
               * 1. handler throws an error
               * 2. handler returns `true` which means that result should be considered successful
               * 3. handler returns _falsy_ which means that the default error should be thrown
               */
              try {
                const passed = await handling.defaultHandlerFn(errorPayload);
                if (passed === true) {
                  log.debug(
                    `The error was fully handled by this function's handling function/callback; resulting in a successful condition [ ${
                      response ? HttpStatusCodes.Accepted : HttpStatusCodes.NoContent
                    } ].`
                  );
                  return isApiGatewayRequest
                    ? {
                        statusCode: response ? HttpStatusCodes.Accepted : HttpStatusCodes.NoContent,
                        headers: getResponseHeaders() as IDictionary,
                        body: response ? JSON.stringify(response) : "",
                      }
                    : response;
                } else {
                  log.debug(
                    "The error was passed to the callback/handler function but it did NOT resolve the error condition."
                  );
                }
              } catch {
                // handler threw an error
                if (isApiGatewayRequest) {
                  return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, error));
                } else {
                  throw new UnhandledError(errorMeta.defaultErrorCode, error);
                }
              }
              break;
            // #endregion

            case "error-forwarding":
              // #region error-forwarding
              log.debug("The error will be forwarded to another function for handling", { arn: handling.arn });
              await invokeLambda(handling.arn, errorPayload);
              break;
            // #endregion

            case "default-error":
              // #region default-error
              /**
               * This handles situations where the user stated that if an
               * "unknown" error occurred that _this_ error should be thrown
               * in it's place.
               */
              handling.error.message = handling.error.message || error.message;
              handling.error.stack = error.stack;
              handling.error.type = "default-error";
              if (isApiGatewayRequest) {
                return convertToApiGatewayError(handling.error);
              } else {
                throw handling.error;
              }

              break;
            // #endregion

            case "default":
              // #region default
              // log.debug(`Error handled by default policy`, {
              //   code: errorMeta.defaultErrorCode,
              //   message: e.message,
              //   stack: e.stack
              // });
              log.info(`the default error code is ${errorMeta.defaultErrorCode}`);
              log.warn(
                "the error response will look like:",
                convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, error))
              );

              if (isApiGatewayRequest) {
                return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, error));
              } else {
                throw new UnhandledError(errorMeta.defaultErrorCode, error);
              }

              break;
            // #endregion

            default:
              log.debug("Unknown handling technique for unhandled error", {
                type: (handling as any).type,
                errorMessage: error.message,
              });
              throw new UnhandledError(errorMeta.defaultErrorCode, error);
          }
        }
      } catch (errorOfError) {
        /**
         * All errors end up here and it is the location where conductor-based
         * error handling can get involved in the error processing flow
         */

        if (errorOfError instanceof ServerlessError) {
          throw errorOfError;
        }

        const forwardedByConductor: OrchestratedErrorForwarder | false =
          sequence.activeFn && sequence.activeFn.onError && Array.isArray(sequence.activeFn.onError)
            ? (sequence.activeFn.onError as OrchestratedErrorForwarder)
            : false;

        if (forwardedByConductor) {
          await invokeLambda(...forwardedByConductor);
        } else {
          // Catch errors in error handlers
          if (
            errorOfError.type === "unhandled-error" ||
            errorOfError.type === "handled-error" ||
            errorOfError.type === "default-error"
          ) {
            throw new RethrowError(errorOfError);
          }

          throw new ErrorWithinError(error, errorOfError);
        }
      }
    }
  };
  // #endregion
};
