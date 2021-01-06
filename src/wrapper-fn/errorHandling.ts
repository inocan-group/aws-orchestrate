import { ErrorHandler, ErrorMeta, ServerlessError } from "../errors";
import { IWrapperErrorContext, ILoggedMessages, findError } from "./index";

/**
 * Provides all error handling for the wrapper function and the contained
 * handler function.
 */
export function errorHandling<T>(msg: ILoggedMessages, expectedErrors: ErrorMeta, context: IWrapperErrorContext<T>) {
  try {
    msg.processingError(context.error, context.workflowStatus, context.isApiGatewayRequest);

    // Look for a "known error"
    const found: Error =
      context.error instanceof ServerlessError ? context.error : findError(context.error, expectedErrors);

    // if (found instanceof ServerlessError) {
    //   found.functionName = context.functionName;
    //   found.classification = found.classification.replace("aws-orchestrate/", `${found.functionName}/`);
    //   found.correlationId = handlerContext.correlationId;
    //   found.awsRequestId = handlerContext.awsRequestId;

    //   throw found;
    // }

    if (found) {
      if (!found.handling) {
        const err = new HandledError(found.code, e, log.getContext());
        if (isApiGatewayRequest) {
          return convertToApiGatewayError(err);
        } else {
          throw err;
        }
      }
      if (found.handling && found.handling.callback) {
        const resolvedLocally = found.handling.callback(e);
        if (!resolvedLocally) {
          // Unresolved Known Error!
          if (isApiGatewayRequest) {
            return convertToApiGatewayError(new HandledError(found.code, e, log.getContext()));
          } else {
            throw new HandledError(found.code, e, log.getContext());
          }
        } else {
          // Known Error was resolved
          log.info(`There was an error which was resolved by a locally defined error handler`, { error: e });
        }
      }

      if (found.handling && found.handling.forwardTo) {
        log.info(`Forwarding error to the function "${found.handling.forwardTo}"`, {
          error: e,
          forwardTo: found.handling.forwardTo,
        });
        await invokeLambda(found.handling.forwardTo, e);
      }
    } else {
      //#region UNFOUND ERROR
      log.debug(`An error is being processed by the default handling mechanism`, {
        defaultHandling: errorMeta.defaultHandling,
        errorMessage: e.message ?? "no error messsage",
        stack: e.stack ?? "no stack available",
      });
      //#endregion
      const errPayload = { ...e, name: e.name, message: e.message, stack: e.stack };
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
            const passed = await handling.defaultHandlerFn(errPayload);
            if (passed === true) {
              log.debug(
                `The error was fully handled by this function's handling function/callback; resulting in a successful condition [ ${
                  result ? HttpStatusCodes.Accepted : HttpStatusCodes.NoContent
                } ].`
              );
              if (isApiGatewayRequest) {
                return {
                  statusCode: result ? HttpStatusCodes.Accepted : HttpStatusCodes.NoContent,
                  headers: getResponseHeaders(),
                  body: result ? JSON.stringify(result) : "",
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
              return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, e));
            } else {
              throw new UnhandledError(errorMeta.defaultErrorCode, e);
            }
          }
          break;
        //#endregion

        case "error-forwarding":
          //#region error-forwarding
          log.debug("The error will be forwarded to another function for handling", {
            arn: handling.arn,
          });
          await invokeLambda(handling.arn, errPayload);
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
          // log.debug(`Error handled by default policy`, {
          //   code: errorMeta.defaultErrorCode,
          //   message: e.message,
          //   stack: e.stack
          // });
          log.info(`the default error code is ${errorMeta.defaultErrorCode}`);
          log.warn(
            `the error response will look like:`,
            convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, e))
          );

          if (isApiGatewayRequest) {
            return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, e));
          } else {
            throw new UnhandledError(errorMeta.defaultErrorCode, e);
          }
          break;
        //#endregion

        default:
          log.debug("Unknown handling technique for unhandled error", {
            type: (handling as any).type,
            errorMessage: e.message,
          });
          throw new UnhandledError(errorMeta.defaultErrorCode, e);
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

    const conductorErrorHandler: OrchestratedErrorHandler | false =
      sequence.activeFn && sequence.activeFn.onError && typeof sequence.activeFn.onError === "function"
        ? (sequence.activeFn.onError as OrchestratedErrorHandler)
        : false;
    const resolvedByConductor = async () => (conductorErrorHandler ? conductorErrorHandler(e) : false);

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
      throw new ErrorWithinError(e, errorOfError);
    }
  }
}
