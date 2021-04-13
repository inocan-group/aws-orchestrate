import { IAwsApiGatewayResponse } from "common-types";
import { KnownError, UnknownError } from "~/errors";
import { IPathParameters, IQueryParameters, IWrapperContext } from "~/types";
import { findError, ErrorMeta, convertToApiGatewayError, getStatusCode, getResponseHeaders } from "../util";

/**
 * Handles _non_-`ServerlessError` thrown during execution of the handler
 * function.
 *
 * If the _caller_ is API Gateway it will return an error response in a format recognized, otherwise
 * it will throw either a `KnownError` or `UnknownError` based on if the error is found via the
 * error management API.
 *
 * @param error The error from the handler function
 * @param errorMeta the configuration for error management
 */
export async function handleOtherErrors<
  I,
  O,
  Q extends object = IQueryParameters,
  P extends object = IPathParameters,
  T extends Error = Error
>(
  originatingError: T,
  errorMeta: ErrorMeta<I, O>,
  request: I,
  context: IWrapperContext<I, O, Q, P>
): Promise<IAwsApiGatewayResponse | O> {
  const { log, isApiGatewayRequest } = context;
  const found = findError<I, O>(originatingError, errorMeta);
  let error: KnownError<I, O> | UnknownError;

  if (found) {
    error = new KnownError<I, O>(originatingError, found, context);

    // User has requested error to be forwarded
    if (found.handling && found.handling.forwardTo) {
      log.info(`forwarding error to ${found.handling.forwardTo}`, { error, arn: found.handling.forwardTo });
      await context.invoke(found.handling.forwardTo, error);
    }

    // User has registered callback
    if (found.handling && found.handling.callback) {
      log.info("Calling handler function's error handler callback", { error });
      const result: O | false = await found.handling.callback(originatingError, found, request, context);
      log.info(
        `Callback returned ${
          result
            ? "successful result; error will abandoned"
            : "without fixing the error; will continue with error processing"
        }`,
        { callback: result }
      );

      if (isApiGatewayRequest) {
        return result
          ? {
              headers: getResponseHeaders(),
              statusCode: getStatusCode(),
              body: JSON.stringify(result),
            }
          : convertToApiGatewayError(error);
      }

      if (result) {
        return result;
      } else {
        throw error;
      }
    }

    if (isApiGatewayRequest) {
      return convertToApiGatewayError(error);
    } else {
      throw error;
    }
  }

  error = new UnknownError(originatingError, context);

  if (isApiGatewayRequest) {
    return convertToApiGatewayError(error);
  } else {
    throw error;
  }

  // switch (handling.type) {
  //   case "handler-fn":
  //     // #region handle-fn
  //     /**
  //      * results are broadly three things:
  //      *
  //      * 1. handler throws an error
  //      * 2. handler returns `true` which means that result should be considered successful
  //      * 3. handler returns _falsy_ which means that the default error should be thrown
  //      */
  //     try {
  //       const passed = await handling.defaultHandlerFn(errorPayload);
  //       if (passed === true) {
  //         log.debug(
  //           `The error was fully handled by this function's handling function/callback; resulting in a successful condition [ ${
  //             response ? HttpStatusCodes.Accepted : HttpStatusCodes.NoContent
  //           } ].`
  //         );
  //         return isApiGatewayRequest
  //           ? {
  //               statusCode: response ? HttpStatusCodes.Accepted : HttpStatusCodes.NoContent,
  //               headers: getResponseHeaders() as IDictionary,
  //               body: response ? JSON.stringify(response) : "",
  //             }
  //           : response;
  //       } else {
  //         log.debug(
  //           "The error was passed to the callback/handler function but it did NOT resolve the error condition."
  //         );
  //       }
  //     } catch {
  //       // handler threw an error
  //       if (isApiGatewayRequest) {
  //         return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, error));
  //       } else {
  //         throw new UnhandledError(errorMeta.defaultErrorCode, error);
  //       }
  //     }
  //     break;
  //   // #endregion

  //   case "error-forwarding":
  //     // #region error-forwarding
  //     log.debug("The error will be forwarded to another function for handling", { arn: handling.arn });
  //     await invokeLambda(handling.arn, errorPayload);
  //     break;
  //   // #endregion

  //   case "default-error":
  //     // #region default-error
  //     /**
  //      * This handles situations where the user stated that if an
  //      * "unknown" error occurred that _this_ error should be thrown
  //      * in it's place.
  //      */
  //     handling.error.message = handling.error.message || error.message;
  //     handling.error.stack = error.stack;
  //     handling.error.type = "default-error";
  //     if (isApiGatewayRequest) {
  //       return convertToApiGatewayError(handling.error);
  //     } else {
  //       throw handling.error;
  //     }

  //     break;
  //   // #endregion

  //   case "default":
  //     // #region default
  //     // log.debug(`Error handled by default policy`, {
  //     //   code: errorMeta.defaultErrorCode,
  //     //   message: e.message,
  //     //   stack: e.stack
  //     // });
  //     log.info(`the default error code is ${errorMeta.defaultErrorCode}`);
  //     log.warn(
  //       "the error response will look like:",
  //       convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, error))
  //     );

  //     if (isApiGatewayRequest) {
  //       return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, error));
  //     } else {
  //       throw new UnhandledError(errorMeta.defaultErrorCode, error);
  //     }

  //     break;
  //   // #endregion

  //   default:
  //     log.debug("Unknown handling technique for unhandled error", {
  //       type: (handling as any).type,
  //       errorMessage: error.message,
  //     });
  //     throw new UnhandledError(errorMeta.defaultErrorCode, error);
  // }
}
