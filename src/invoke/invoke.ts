import { IDictionary } from "common-types";
import { logger } from "aws-log";
import { buildInvocationRequest } from "..";
import { parseArn } from "~/shared";

export type InvocationResponse = import("aws-sdk").Lambda.InvocationResponse;

export type UnconstrainedHttpHeaders = IDictionary<string | number | boolean>;
export type LambdaInvocation<T = IDictionary, H = UnconstrainedHttpHeaders> = (
  functionArn: string,
  request: T,
  additionalHeaders?: H
) => Promise<InvocationResponse>;

/**
 * **invoke**
 *
 * Invokes another Lambda function while passing the `correlation-id` along
 * to the next function for logging purposes.
 */
export async function invoke<T = IDictionary>(
  /**
   * A reference to the serverless function you are calling; can be a
   * fully qualified AWS arn but if your execution environment has the
   * appropriate ENV variables set then only the actual handlers name
   * is needed.
   *
   * ENV variables that will be used to _resolve_ the full ARN include:
   * - AWS_REGION
   * - AWS_ACCOUNT
   * - AWS_STAGE (*or alternatively NODE_ENV, ENVIRONMENT*)
   * - SERVICE_NAME (*or alternatively APP_NAME*)
   */
  functionArn: string,
  /** the request object to be passed to the calling function */
  request: T
  /**
   * The request headers to send along with the request
   */
  // headers?: IHttpRequestHeaders
): Promise<InvocationResponse> {
  // TODO: come back to this idea of "headers" here
  const lambda = new (await import("aws-sdk")).Lambda();
  return new Promise((resolve) => {
    lambda.invoke(buildInvocationRequest(parseArn(functionArn), request), (error_, data) => {
      if (error_) {
        const { error } = logger().reloadContext();
        const e = new Error(error_.message);
        e.stack = error_.stack;
        e.name = "InvocationError";
        error(e, error_);
        throw e;
      }
      resolve(data);
    });
  });
}
