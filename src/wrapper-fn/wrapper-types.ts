import { IAWSLambaContext } from "common-types";

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
  request: T;
  workflowStatus: WorkflowStatus;
}
