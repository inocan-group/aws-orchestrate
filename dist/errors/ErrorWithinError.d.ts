/**
 * Errors which are encountered while handling an error. These secondary errors
 * should always originate from the **wrapper** function rather than the consumer's
 * _handler_ function.
 */
export declare class ErrorWithinError extends Error {
    /**
     * creates an error to be thrown by a **Lambda** function which
     * was initiatiated by a
     */
    /**
     * The `name` is of the format `type`/`sub-type`
     */
    name: string;
    /**
     * The `code` is the "sub-type" of the name
     */
    code: string;
    /** the HTTP errorCode */
    httpStatus: number;
    /** the AWS requestId */
    requestId: string;
    originalStack: string;
    constructor(
    /** the original error */
    originalError: Error, 
    /** the error encountered within the error handling section */
    secondaryErr: Error);
}
