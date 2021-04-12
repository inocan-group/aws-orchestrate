import { IWrapperContext } from "~/types";
import { isServerlessError } from "~/errors";

/**
 * Handles all errors which are thrown while the handler function (within the wrapper)
 * is being executed.
 */
export function handleError<T extends Error, P, Q>(
  error: T,
  context: IWrapperContext<P, Q>,
  duration: number,
  prepTime: number
) {
  try {
    const log = context.log;
    if (isServerlessError(error)) {
      // if a handler function throws a serverless error we just keep as is
      // as this was an intentional error being thrown by handler
      log.info(`Done. Returning a ServerlessError error thrown by handler function`, {
        success: false,
        duration,
        prepTime,
      });
      // enhance the error with meta attributes
      error.functionName = context.functionName;
      error.correlationId = context.correlationId;
      error.awsRequestId = context.awsRequestId;

      // respond based on whether caller is API Gateway
      if (context.isApiGatewayRequest) {
        return convertToApiGatewayError(error);
      } else {
        throw error;
      }
    } else {
      // An error was thrown by the handler function but it was not a ServerlessError
      // which means it may have been unexpected, however, it's also possible that the
      // error fits a patterned identified in the Error Manamagement configuration.
      log.debug(`A non-ServerlessError thrown in "${context.functionName}" handler function`, {
        error,
        context,
      });
      return manageHandlerError(error, errorMeta);
    }
  } catch (errorHandlingError) {}
}
