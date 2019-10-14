import { IAwsLogContext } from "aws-log";
import { IErrorWithExtraProperties } from "../@types";
export declare class HandledError extends Error {
    /**
     * Create a serialized/string representation of the error
     * for returning to **API Gateway**
     */
    static apiGatewayError(errorCode: number, e: Error, context: IAwsLogContext): string;
    /**
     * creates an error to be thrown by a **Lambda** function which
     * was initiatiated by a
     */
    static lambdaError(errorCode: number, e: Error, context: IAwsLogContext): void;
    /**
     * The `name` is proxied through if underlying error has one that is NOT just **Error**;
     * otherwise it takes on the functions name
     */
    name: string;
    /**
     * The `code` is proxied through if underlying error has one and if not then it
     * takes on the string `handled-error`
     */
    code: string;
    type: string;
    classification: string;
    functionName: string;
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
     * type will be defaulted to `handled-error`
     */
    constructor(errorCode: number, e: IErrorWithExtraProperties, context: IAwsLogContext);
}
