import { ILoggerApi } from "aws-log";
import { IAwsLambdaContext } from "common-types";
import { convertToApiGatewayError, ServerlessError } from "~/errors";

export function handlePrepError<T extends Error>(
  prepError: T,
  context: IAwsLambdaContext,
  isApiGatway: boolean,
  log: ILoggerApi
) {
  const err = new ServerlessError(
    500,
    `The wrapper function for "${context.functionName} [${context.awsRequestId}]" ran into problems prior handing off to the handler function. The error encountered was: ${prepError.message}`,
    "wrapper-fn/prep"
  );
  err.stack = prepError.stack;
  err.functionName = context.functionName;
  err.awsRequestId = context.awsRequestId;

  // log to cloudwatch
  log.warn(err.message, { error: err });

  if (isApiGatway) {
    // dummy down message for outside callers
    err.message = "unexpected error, try back later";
    return convertToApiGatewayError(err);
  } else {
    throw err;
  }
}
