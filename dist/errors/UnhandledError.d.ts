export declare class UnhandledError extends Error {
    /**
     * Create a serialized/string representation of the error
     * for returning to **API Gateway**
     */
    static apiGatewayError(errorCode: number, e: Error, requestId: string, classification?: string): {
        statusCode: number;
        errorType: string;
        errorMessage: string;
        stackTrace: string;
        body: string;
    };
    /**
     * creates an error to be thrown by a **Lambda** function which
     * was initiatiated by a
     */
    static lambdaError(errorCode: number, e: Error, classification?: string): void;
    /**
     * The `name` is of the format `type`/`sub-type`
     */
    name: string;
    /**
     * The `code` is the "sub-type" of the name
     */
    code: string;
    type: "unhandled-error";
    /** the HTTP errorCode */
    httpStatus: number;
    /** the AWS requestId */
    requestId: string;
    /**
     * **Constructor**
     *
     * @param errorCode the numeric HTTP error code
     * @param e the error which wasn't handled
     * @param classification the type/subtype of the error; if only `subtype` stated then
     * type will be defaulted to `unhandled-error`
     */
    constructor(errorCode: number, e: Error & {
        code?: string;
    }, classification?: string);
}
