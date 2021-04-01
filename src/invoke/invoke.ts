import { IDictionary } from "common-types";
import { logger } from "aws-log";
import {
  IOrchestratedRequest,
  LambdaSequence,
  buildOrchestratedRequest,
  parseArn,
  buildInvocationRequest,
} from "../private";

export type InvocationResponse = import("aws-sdk").Lambda.InvocationResponse;

export type UnconstrainedHttpHeaders = IDictionary<string | number | boolean>;
export type LambdaInvocation<T = IDictionary, H = UnconstrainedHttpHeaders> = (
  fnArn: string,
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
  fnArn: string,
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
    lambda.invoke(buildInvocationRequest(parseArn(fnArn), request), (err, data) => {
      if (err) {
        const { error } = logger().reloadContext();
        const e = new Error(err.message);
        e.stack = err.stack;
        e.name = "InvocationError";
        error(e, err);
        throw e;
      }
      resolve(data);
    });
  });
}

/**
 * A higher-order function which accepts a _sequence_ as an input first.
 * In essence, this just provides useful configuration which the _wrapper
 * function_ can provide and then it passes the remaining function down
 * to the consumer of this library to use in the handler function (aka, as
 * part of the `context` object passed into the handler).
 *
 * Calling the first function returns a _invocation_ function which just
 * takes the ARN and request params (optionally allowing additional
 * _headers_ too).
 */
export function invokeSequence(sequence: LambdaSequence) {
  return <T = IDictionary, H = UnconstrainedHttpHeaders>(fnArn: string, request: T, additionalHeaders?: H) => {
    const boxedRequest = buildOrchestratedRequest<T>(request, sequence, additionalHeaders);

    return invoke<IOrchestratedRequest<T>>(fnArn, boxedRequest);
  };
}
