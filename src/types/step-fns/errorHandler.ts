import { ICatchConfigurableStepFn, IFinalizedStepFn, IStepFnShorthand } from "~/types";
import { IConfigurableStepFn } from "./stepFunction";

/**
 * Step Function Common Errors
 *
 * [AWS Documentation](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)
 */
export interface IErrorType {
  /**
   * A wildcard that matches any known error name.
   */
  all: "States.ALL";
  /**
   * An execution failed due to some exception that could not be processed.
   *
   * Often these are caused by errors at runtime, such as attempting to apply InputPath or OutputPath on a null JSON payload. A States.
   * Runtime error is not retriable, and will always cause the execution to fail.
   * A retry or catch on States.ALL will not catch States.Runtime errors.
   */
  runtime: "States.Runtime";
  /**
   * A Task state either ran longer than the TimeoutSeconds value, or failed to send a heartbeat for a period longer than the HeartbeatSeconds value.
   */
  timeout: "States.Timeout";
  /**
 * A States.DataLimitExceeded exception will be thrown for the following:

  When the output of a connector is larger than payload size quota.
  When the output of a state is larger than payload size quota.
  When, after Parameters processing, the input of a state is larger than the payload size quota.
  For more information on quotas, see Quotas for Standard Workflows and Quotas for Express Workflows.
 */
  dataLimitExceeded: "States.DataLimitExceeded";
  /**
   * A Task state failed during the execution.
   */
  taskFailed: "States.TaskFailed";
  /**
   * A Task state failed because it had insufficient privileges to execute the specified code.
   */
  permissions: "States.Permissions";

  /**
   *
   * @param error it refers to the error name. If you use a children of `Error` class or specify the `name` property of an `Error`,
   *  it will be used as the payload object key called `Error` that is the one which is evaluated with `Equals` operator
   * on `Catch` feature of step function
   */
  custom(error: string): string;
}

export type IResultPath = `\$.${string}`;

export interface IErrorTypeSelector {
  (e: IErrorType): string;
}

export interface ICatchFluentStepFnApi {
  (sf: ICatchConfigurableStepFn): IConfigurableStepFn | IFinalizedStepFn;
}

export type IErrorHandlerPointer = ICatchFluentStepFnApi | IStepFnShorthand | IFinalizedStepFn;

/**
 * Provides configuration information so that errors can be (potentially)
 * matched and handled.
 */
export interface ICatchErrorHandler {
  selector: IErrorHandlerPointer;
  resultPath?: Partial<IResultPath>;
}

export interface RetryOptions {
  /** An integer that represents the number of seconds before the first retry attempt (default 1). */
  intervalSeconds?: number;
  /** A number that is the multiplier by which the retry interval increases on each attempt (default 2.0). */
  backoffRate?: number;
  /** A positive integer, representing the maximum number of retry attempts (default 3). If the error recurs more times than specified, retries cease and normal error handling resumes. A value of 0 is permitted and indicates that the error or errors should never be retried. */
  maxAttempts?: number;
}
