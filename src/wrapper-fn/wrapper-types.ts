import { arn, IAWSLambaContext } from "common-types";
import { AwsResource } from "..";

export type WorkflowStatus =
  | "initializing"
  | "unboxing-from-prior-function"
  | "starting-try-catch"
  | "prep-starting"
  | "running-function"
  | "function-complete"
  | "invoke-complete"
  | "invoke-started"
  | "sequence-defined"
  | "sequence-starting"
  | "sequence-started"
  | "sequence-tracker-starting"
  | "completing"
  | "returning-values";

/**
 * When using the _wrapper_ function, an "error context" will be
 * summarized in this format to be passed forward to any possible
 * handlers to best
 */
export interface IWrapperErrorContext<T = Record<string, unknown>> {
  error: Error;
  handlerFunction: string;
  caller?: IAWSLambaContext["clientContext"];
  isApiGatewayRequest: boolean;
  correlationId: string;
  awsRequestId: string;
  triggeredBy: AwsResource;
  request: T;
  workflowStatus: WorkflowStatus;
}

/**
 * The Error payload which are guarenteed to be delivered in error conditions
 * taking place within the _wrapper function_.
 */
export interface IErrorContext<T = Record<string, unknown>> extends IWrapperErrorContext<T>, Error {
  code: string;
  httpCode: number;
  message: string;
  stack: string;
  /** an underlying error if the top level error is wrapping another */
  underlying?: Error;
  /** optionally state an ARN which the error should be forwarded to */
  forwardTo?: arn;
}
