import { ErrorHandler } from "../ErrorHandler";
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
export class ErrorMeta {
    constructor() {
        this._errors = [];
        this._defaultErrorCode = DEFAULT_ERROR_CODE;
    }
    /**
     * Add an error handler for a known/expected error
     */
    addHandler(
    /** the return code that will be returned for this error */
    code, 
    /** how will an error be matched */
    identifiedBy, 
    /**
     * how will an error be handled; it doesn't NEED to be handled and its a reasonable
     * goal/outcome just to set the appropriate http error code
     */
    handling) {
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
    setDefaultErrorCode(code) {
        this._defaultErrorCode = code;
        return this;
    }
    setDefaultHandler(param) {
        switch (typeof param) {
            case "string":
                this._arn = param;
                this._defaultHandlerFn = undefined;
                this._defaultError = undefined;
                break;
            case "function":
                this._defaultHandlerFn = param;
                this._arn = undefined;
                this._defaultError = undefined;
                break;
            default:
                if (param instanceof Error) {
                    this._defaultError = param;
                    this._arn = undefined;
                    this._defaultHandlerFn = undefined;
                }
                else {
                    console.log({
                        message: `The passed in setDefaultHandler param was of an unknown type ${typeof param}; the action has been ignored`
                    });
                }
        }
        return this;
    }
    /**
     * States how to deal with the default error handling. Default
     * error handling is used once all "known errors" have been exhausted.
     */
    get defaultHandling() {
        if (this._arn) {
            return {
                type: "error-forwarding",
                code: this.defaultErrorCode,
                arn: this._arn,
                prop: "_arn"
            };
        }
        if (this._defaultHandlerFn) {
            return {
                type: "handler-fn",
                code: this.defaultErrorCode,
                defaultHandlerFn: this._defaultHandlerFn,
                prop: "_defaultHandlerFn"
            };
        }
        if (this._defaultError) {
            return {
                type: "default-error",
                code: this.defaultErrorCode,
                error: this._defaultError,
                prop: "_defaultError"
            };
        }
        return {
            type: "default",
            code: this.defaultErrorCode,
            prop: "_default"
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
            errors: this._errors
        });
    }
}
//# sourceMappingURL=ErrorMeta.js.map