import { ErrorKind, IBaseErrorOptions } from "./types";
export interface IApiGatewayOptions<TCode extends string = string, TError extends number = number> extends IBaseErrorOptions<TCode, TError> {
    fnParams?: any[];
    code?: TCode;
}
export interface IApiGatewayErrorConstructor<TCode extends string = string, TError extends number = number> {
    new (errorCode: TError, errorMessage: string, options?: IApiGatewayOptions<TCode, TError>): IApiGatewayError<TCode, TError>;
}
export interface IApiGatewayError<TCode extends string = string, TError extends number = number> extends Error {
    kind: Readonly<ErrorKind.ApiGatewayError>;
    /**
     * The name of the serverless project / repo
     */
    projectName: Readonly<string>;
    /**
     * The name of the function that was executing
     */
    fnName: Readonly<string>;
    /**
     * The classification of the error a combination of the app's
     * name and the error code passed in.
     */
    classification: Readonly<string>;
    /**
     * A string based code to classify the error
     */
    code: Readonly<TCode>;
    /**
     * An HTTP Error code; this is not required for an `AppError`'s but may be provided
     * optionally.
     */
    errorCode: Readonly<TError>;
    /** human friendly error message */
    errorMessage: Readonly<string>;
}
/**
 * An Error thrown by a application which does _not_ require a numeric
 * HTTP error code on each throw. You may, however, include one where appropriate,
 * and you have the option when configuring the error to state a "default" HTTP code
 * (though no default will be provided unless you state it)
 */
export declare function createApiGatewayError<TCode extends string = string, TError extends number = number>(projectName: string, fnName: string, defaultOptions?: IApiGatewayOptions<TCode, TError>): IApiGatewayErrorConstructor<TCode, TError>;
