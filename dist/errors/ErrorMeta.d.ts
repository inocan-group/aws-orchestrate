import { ErrorHandler } from "../ErrorHandler";
import { IErrorIdentification, IErrorHandling } from "../@types";
export declare const DEFAULT_ERROR_CODE = 500;
export interface IError {
    message?: string;
    name?: string;
    code?: string;
    stack?: string;
}
export interface IErrorMessageControl<T extends IError = Error> {
    (err: T): string | string;
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
export declare class ErrorMeta {
    private _errors;
    private _defaultErrorCode;
    private _arn;
    /**
     * Add another error type to the expected error types.
     */
    add(
    /** the return code that will be returned for this error */
    code: number, 
    /** how will an error be matched */
    identifiedBy: IErrorIdentification, 
    /**
     * how will an error be handled; it doesn't NEED to be handled and its a reasonable
     * goal/outcome just to set the appropriate http error code
     */
    handling?: IErrorHandling): void;
    /**
     * Returns the list of errors being managed.
     */
    readonly list: ErrorHandler[];
    /**
     * Allows you to set a default code for unhandled errors; the default is
     * `500`. This method follows the _fluent_ conventions and returns and instance
     * of itself as a return value.
     *
     * Note: if an unhandled error has the property of `httpStatus` set and is a number
     * then it will be respected over the default.
     */
    setDefaultErrorCode(code: number): this;
    /**
     * **setDefaultHandlerFunction**
     *
     *
     *
     * @param arn the function's arn (this can be the abbreviated variety so long as
     * proper ENV variables are set)
     */
    setDefaultHandlerFunction(arn: string): this;
    /**
     * The default code for unhandled errors.
     *
     * Note: if an unhandled error has the property of `httpStatus` set and is a number
     * then it will be respected over the default.
     */
    readonly defaultErrorCode: number;
    toString(): string;
}
