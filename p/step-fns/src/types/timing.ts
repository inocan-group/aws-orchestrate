import { ms } from "common-types";

export interface IWrapperMetricsStart {
  kind: "start";
  startTime: number;
}

export interface IWrapperMetricsPrepped {
  kind: "prepped";
  startTime: number;
  prepTime: number;
}

export interface IWrapperMetricsPreClosure {
  kind: "pre-closure";
  startTime: number;
  prepTime: number;
  /**
   * The duration from `startTime` to the point where normal execution stopped
   * where "normal execution" stops when the handler function give back control
   * to the wrapper function based on a successful response or an error.
   */
  duration: number;
  /** flag to indicate whether duration was result of a successful response */
  success: boolean;
}

export interface IWrapperMetricsClosure {
  kind: "wrapper-metrics";
  startTime: number;
  prepTime: number;
  /**
   * The duration in miliseconds from `startTime` to the point where normal execution
   * stopped where "normal execution" stops when the handler function give back control
   * to the wrapper function based on a successful response or an error.
   */
  duration: ms;
  /** flag to indicate whether duration was result of a successful response */
  success: boolean;

  /**
   * The duration -- in miliseconds -- it took to move from pre-closure to closure
   */
  closureDuration: ms;

  /**
   * Whether a handler function was run as part of error handling
   */
  handlerFunction?: boolean;

  /**
   * Whether the error handling forward the error onto another Lambda
   */
  handlerForwarding?: boolean;

  /**
   * Indicates that an error occurred but there was a handler which was
   * able to convert it to a successful outcome
   */
  handlerResolved?: boolean;

  /**
   * Categorizes the error into _known_ or _unknown_ error types.
   */
  errorType?: "known" | "unknown";
  errorCode?: number;
  /**
   * A flag indicating there not only an originating error but an underlying error during
   * error handling.
   */
  underlyingError?: boolean;
}

export type IWrapperMetrics =
  | IWrapperMetricsClosure
  | IWrapperMetricsPreClosure
  | IWrapperMetricsPrepped
  | IWrapperMetricsStart;
