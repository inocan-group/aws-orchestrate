import { ErrorHandler } from "../../errors/ErrorHandler";
import { IErrorIdentification, IErrorHandling, IErrorHandlerFunction, IErrorClass, IDefaultHandling } from "~/types";
export const DEFAULT_ERROR_CODE = 500;

export interface IError {
  message?: string;
  name?: string;
  code?: string;
  stack?: string;
}

export interface IErrorMessageControl<T extends IError = Error> {
  (error: T): string | string;
}

export interface IExpectedErrorOptions<T extends IError = Error> {
  error?: new <T extends IError>() => T;
  /**
   * You can _prepend_ a static string to the error message's
   * "message" or instead have the error passed into a function
   * to generate the message.
   */
  message?: IErrorMessageControl<T>;
  /**
   * Set to true if this error should be thrown in the event of
   * and unhandled error.
   */
  isDefault?: boolean;
}

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
  private _arn?: string;
  private _defaultHandlerFn?: IErrorHandlerFunction;
  private _defaultError?: IErrorClass;

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
   * `500`. This method follows the _fluent_ conventions and returns and instance
   * of itself as a return value.
   *
   * Note: if an unhandled error has the property of `httpStatus` set and is a number
   * then it will be respected over the default.
   */
  setDefaultErrorCode(code: number) {
    this._defaultErrorCode = code;
    return this;
  }

  setDefaultHandler(function_: IErrorHandlerFunction): ErrorMeta<I, O>;
  setDefaultHandler(error: Error): ErrorMeta<I, O>;
  /**
   * **setDefaultHandler**
   *
   * @param err if you want to shift the error to a particular static error then you
   * can just pass it in:
   *
   * ```typescript
   * context.errors.setDefaultHandler(new Error('my message'))
   * ```
   *
   * At the time of the error it will evaluate if your default error already has a _message_
   * and if it _does not_ then it will inject the runtime's error message into the error class
   * you provided.
   *
   * In all cases, it will replace the runtime error's stack with what was passed in.
   */
  setDefaultHandler(function_: (error: Error) => Promise<boolean> | boolean): ErrorMeta<I, O>;
  /**
   * **setDefaultHandler**
   *
   * @param arn the function's arn (this can be the abbreviated variety so long as
   * proper ENV variables are set)
   */
  setDefaultHandler(arn: string): ErrorMeta<I, O>;
  setDefaultHandler(parameter: string | Error | IErrorHandlerFunction): ErrorMeta<I, O> {
    switch (typeof parameter) {
      case "string":
        this._arn = parameter;
        this._defaultHandlerFn = undefined;
        this._defaultError = undefined;
        break;
      case "function":
        this._defaultHandlerFn = parameter;
        this._arn = undefined;
        this._defaultError = undefined;
        break;
      default:
        if (parameter instanceof Error) {
          this._defaultError = parameter;
          this._arn = undefined;
          this._defaultHandlerFn = undefined;
        } else {
          console.log({
            message: `The passed in setDefaultHandler param was of an unknown type ${typeof parameter}; the action has been ignored`,
          });
        }
    }

    return this;
  }

  /**
   * States how to deal with the default error handling. Default
   * error handling is used once all "known errors" have been exhausted.
   */
  public get defaultHandling(): IDefaultHandling {
    if (this._arn) {
      return {
        type: "error-forwarding",
        code: this.defaultErrorCode,
        arn: this._arn,
        prop: "_arn",
      };
    }

    if (this._defaultHandlerFn) {
      return {
        type: "handler-fn",
        code: this.defaultErrorCode,
        defaultHandlerFn: this._defaultHandlerFn,
        prop: "_defaultHandlerFn",
      };
    }

    if (this._defaultError) {
      return {
        type: "default-error",
        code: this.defaultErrorCode,
        error: this._defaultError,
        prop: "_defaultError",
      };
    }

    return {
      type: "default",
      code: this.defaultErrorCode,
      prop: "_default",
    };
  }

  /**
   * The default code for unhandled errors.
   *
   * Note: if an unhandled error has the property of `httpStatus` set and is a number
   * then it will be respected over the default.
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
