import { arn, HttpStatusCodes, TypeSubtype } from "common-types";
import { ErrorHandler } from "~/errors";
import { IWrapperContext } from "./wrapper-context";
import { IPathParameters, IQueryParameters } from "./wrapper-types";

/**
 * A callback function provided by Handler Function to the wrapper
 * to handle error conditions.
 */
export type IErrorHandlingCallback<
  I,
  O,
  Q extends object = IQueryParameters,
  P extends object = IPathParameters,
  T extends Error = Error
> = (error: T, handler: ErrorHandler<I, O>, request: I, context: IWrapperContext<I, O, Q, P>) => Promise<O | false>;

/**
 * Provides the _means_ that an error can be "handled". This is either
 * that it is `forwardedTo` a different **arn** (aka, another function),
 * or that an _in-process_ callback has been provided.
 *
 * In the case of a `callback`, if a function returns "truthy" it will
 */
export interface IErrorHandling<I, O, Q extends object = IQueryParameters, P extends object = IPathParameters> {
  /**
   * forward to another lambda function to report the error or take some other action.
   *
   * **Note:** the `forwardTo` functionality largely overlapping with the more recently
   * introduce Lambda Destinations functionality and if this can be used instead it is
   * preferable.
   */
  forwardTo?: arn;
  /**
   * The async callback function is allowed to produce side-effects if this is desired
   * (aka, send an email, sms, or whatever) and unlike a `forwardTo` response, it
   * _can_ try to remedy the error condition.
   *
   * The return value of a callback must either be `false` (indicating that the
   * error was not corrected) or will remain with the same expected output the
   * function itself.
   *
   * Finally, if the callback produces an error during handling it will be presumed to have
   * **not** fixed the problem and the original error will be used (but this callback error
   * will be attached as a the `callbackError` property)
   */
  callback?: IErrorHandlingCallback<I, O, Q, P>;
}

export interface IErrorHandlingDefault {
  defaultHandling: true;
}

export interface IError extends Error {
  code?: string;
  httpStatus?: number;
}

export interface IExtendedError {
  /** uniquely identifies the error type */
  kind: string;

  /**
   * A PascalCased name of the error.
   *
   * **Note:** _it is common for many errors to have `kind` and `name` be the same but they can vary_
   */
  name: string;

  /**
   * The HTTP Error code associated with the error
   */
  httpStatus: HttpStatusCodes | number;

  /**
   * A string name for the error which typically matches up with the "sub-type" of the
   * error's classification.
   */
  code: string;

  /**
   * The type/sub-type of the error
   */
  classification: TypeSubtype;
}

export interface IServerlessError extends IExtendedError {
  message: string;
  /**
   * The handler function' name
   */
  functionName: string;

  /**
   * the sequence's correlation ID
   */
  correlationId: string;

  /**
   * The specific AWS request ID used for this function's execution
   */
  awsRequestId: string;
}
