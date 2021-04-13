import { ServerlessError } from "~/errors";
import { IWrapperContext } from "~/types";

export function handleServerlessError<Q, P>(
  error: ServerlessError,
  context: IWrapperContext<Q, P>,
  duration: number,
  prepTime: number
) {
  const log = context.log;

  // if a handler function throws a serverless error we just keep as is
  // as this was an intentional error being thrown by handler
  log.info("Done. Returning a ServerlessError error thrown by handler function", {
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
}
