import { IAwsApiGatewayErrorResponse } from "common-types";
import { ErrorMeta } from "~/errors/ErrorMeta";

/**
 * Handles _non_-`ServerlessError` thrown during execution of the handler
 * function.
 *
 * @param error The error from the handler function
 * @param errorMeta the configuration for error management
 */
export function manageHandlerError<T extends Error>(error: T, errorMeta: ErrorMeta): IAwsApiGatewayErrorResponse {
  const found: ServerlessError | ErrorHandler | false =
    error instanceof ServerlessError ? error : findError(error, errorMeta);

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
