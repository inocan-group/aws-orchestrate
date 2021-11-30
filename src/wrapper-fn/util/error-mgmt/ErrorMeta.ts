import { IErrorIdentification, IErrorHandling, IErrorHandlerFunction } from "~/types";
import { arn, AwsArnLambda, isLambdaFunctionArn } from "common-types";
import { isServerlessError, ServerlessError } from "~/errors";
import { parseLambdaFunctionArn } from "~/shared/parseLambdaFunctionArn";
import { ErrorHandler } from "./ErrorHandler";

export const DEFAULT_ERROR_CODE = 500;

/**
 * Is a container for a serverless function that
 * describes:
 *
 * 1. What errors are _expected_
 * 2. **Meta** for all errors -- expected and unexpected -- on:
 *    - the return's exit code (which is typically a reduced set from the errors themselves)
 *    - how to handle them (do something in the _current fn_ or pass to a _handling function_)
 *
 * By default, all errors are given a 500 exit code and log the error at the "error" severity
 * level but perform no additional work.
 */
export class ErrorMeta<I, O> {
  private _errors: ErrorHandler<I, O>[] = [];
  private _defaultErrorCode: number = DEFAULT_ERROR_CODE;
  private _defaultHandler?: IErrorHandlerFunction<O> | AwsArnLambda;

  /**
   * Add an error handler for a known/expected error
   */
  addHandler(
    /** the return code that will be returned for this error */
    code: number,
    /** how will an error be matched */
    identifiedBy: IErrorIdentification,
    /**
     * how will an error be handled; it doesn't NEED to be handled and its a reasonable
     * goal/outcome just to set the appropriate http error code
     */
    handling: IErrorHandling<I, O>
  ) {
    this._errors.push(new ErrorHandler(code, identifiedBy, handling));
  }

  /**
   * Returns the list of errors being managed.
   */
  get list() {
    return this._errors;
  }

  /**
   * Allows you to set a default code for unhandled errors; the default is
   * `500`.
   *
   * Note: if an unhandled error _has_ the property `httpStatus` this will be
   * used over the value set here.
   */
  setDefaultErrorCode(code: number) {
    this._defaultErrorCode = code;
    return this;
  }
  /**
   * **setDefaultHandler**
   *
   * If you pass in an AWS arn, any _unhandled_ errors will asynchronously invoke the ARN
   * and then exit with the error wrapped in an `UnknownError`.
   */
  setDefaultHandler(arn: arn): ErrorMeta<I, O>;
  /**
   * **setDefaultHandler**
   *
   * When passing in a callback, you are ensuring that when unhandled errors are encountered
   * this callback will be executed. If it can "recover" it may pass back a return value of
   * `<O>`, otherwise it may instead return _false_.
   *
   * Note: this function is asynchronous and it's understood that in many cases this callback
   * will be involved in side effects to notify or log certain events.
   */
  setDefaultHandler(callback: IErrorHandlerFunction<O>): ErrorMeta<I, O>;
  setDefaultHandler(arg: arn | IErrorHandlerFunction<O>): ErrorMeta<I, O> {
    if (typeof arg === "string") {
      // appears to be a ARN
      try {
        this._defaultHandler = isLambdaFunctionArn(arg) ? arg : parseLambdaFunctionArn(arg).arn;
      } catch (parseError) {
        const message = `While attempting to parse the passed in ARN [${arg}] for default error handling, an error occurred: ${
          (parseError as Error)?.message
        }`;
        if (isServerlessError(parseError)) {
          parseError.message = message;
          throw parseError;
        } else {
          throw new ServerlessError(500, message, "arn/parsing-error");
        }
      }
    } else {
      this._defaultHandler = arg;
    }

    return this;
  }

  public get defaultHandler() {
    return this._defaultHandler;
  }

  /**
   * The default code for unhandled errors.
   */
  get defaultErrorCode() {
    return this._defaultErrorCode;
  }

  toString() {
    return JSON.stringify({
      defaultCode: this._defaultErrorCode,
      errors: this._errors,
    });
  }
}
