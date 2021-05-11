import { HttpStatusCodes } from "common-types";
import { logger } from "aws-log";
import { buildInvocationRequest } from ".";
import { parseArn } from "~/shared";
import { LambdaInvocationConfigurator, LambdaInvocationResponse } from "~/types";
import type { Lambda } from "aws-sdk";
import { ServerlessError } from "~/errors";

export const configureLambda: LambdaInvocationConfigurator = (Lambda?: Lambda) => {
  /**
   * **invoke**
   *
   * Invokes another Lambda function while passing the `correlation-id` along
   * to the next function for logging purposes.
   */
  return async function invoke<T = any>(
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
  ): Promise<LambdaInvocationResponse> {
    if (!Lambda) {
      throw new ServerlessError(
        HttpStatusCodes.InternalServerError,
        "The handler function attempted to invoke another Lambda function without first passing in the Lambda class to the wrapper's option hash.",
        "wrapper-fn/bad-configuration"
      );
    }

    return new Promise((resolve) => {
      Lambda.invoke(buildInvocationRequest(parseArn(functionArn), request), (error_, data) => {
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
  };
};
