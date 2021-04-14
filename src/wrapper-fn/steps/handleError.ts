import { IPathParameters, IQueryParameters, IServerlessError, IWrapperContext } from "~/types";
import { isServerlessError, UnknownError } from "~/errors";
import { handleServerlessError } from "./handleServerlessError";
import { handleOtherErrors } from "./handleOtherErrors";
import { IDictionary, isTypeSubtype } from "common-types";
import { convertToApiGatewayError } from "../util";

/**
 * Handles all errors which are thrown when using the _wrapper function_
 * and past the _prep_ phase.
 */
export async function handleError<
  I,
  O,
  Q extends object = IQueryParameters,
  P extends object = IPathParameters,
  T extends Error = Error
>(error: T, request: I, context: IWrapperContext<I, O, Q, P>, duration: number, prepTime: number) {
  const log = context.log;
  try {
    const log = context.log;
    if (isServerlessError(error)) {
      // A `ServerlessError` is always an _intentful_ error which a user
      // will have thrown for explicit reasons

      return handleServerlessError(error, context, duration, prepTime);
    } else {
      // An error was thrown by the handler function but it was not a ServerlessError
      // which means it may have been unexpected, however, it's also possible that the
      // error fits a patterned identified in the Error Manamagement configuration.
      log.debug(`A non-ServerlessError thrown in "${context.functionName}" handler function`, {
        error,
        context,
      });

      return handleOtherErrors<I, O, P, Q>(error, context.errorMgmt, request, context);
    }
  } catch (errorHandlingError) {
    log.warn("There was an error which occurred during error handling", { originalError: error, errorHandlingError });
    const classification =
      typeof (error as IDictionary).classification === "string" &&
      isTypeSubtype(((error as unknown) as IServerlessError).classification)
        ? (error as IDictionary).classification
        : "wrapper-fn/unknown-error";
    const err = isServerlessError(error) ? error : new UnknownError(error, context, classification);
    err.errorHandlingError = errorHandlingError;
    if (context.isApiGatewayRequest) {
      return convertToApiGatewayError(err);
    } else {
      throw err;
    }
  }
}
