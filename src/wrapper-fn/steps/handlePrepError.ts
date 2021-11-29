import { ILoggerApi } from "aws-log";
import { IAwsLambdaContext } from "common-types";
import { apiGatewayFailure } from "../util";
import { ServerlessError } from "~/errors";

export function handlePrepError<T extends unknown>(
  prepError: T,
  context: IAwsLambdaContext,
  isApiGatway: boolean,
  log: ILoggerApi
) {
  const pError =
    typeof prepError === "object" && "message" in (prepError as any)
      ? (prepError as { message: string; [key: string]: string | undefined })
      : ({ message: String(prepError) } as { message: string; [key: string]: string | undefined });

  const err = new ServerlessError(
    500,
    `The wrapper function for "${context.functionName} [${context.awsRequestId}]" ran into problems prior handing off to the handler function. The error encountered was: ${pError.message}`,
    "wrapper-fn/prep"
  );
  err.stack = pError?.stack;
  err.functionName = context.functionName;
  err.awsRequestId = context.awsRequestId;

  // log to cloudwatch
  log.warn(err.message, { error: err });

  if (isApiGatway) {
    // dummy down message for outside callers
    err.message = "unexpected error, try back later";
    return apiGatewayFailure(err);
  } else {
    throw err;
  }
}
