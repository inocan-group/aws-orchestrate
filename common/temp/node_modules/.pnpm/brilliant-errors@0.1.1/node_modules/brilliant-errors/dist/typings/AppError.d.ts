import { IBaseErrorOptions, ErrorKind } from "./index";
export interface IAppOptions<TCode extends string = string, TError extends number = number> extends IBaseErrorOptions<TCode, TError> {
}
export interface IAppErrorConstructor<TCode extends string = string, TError extends number = number> {
    new (message: string, code?: TCode, options?: IAppOptions<TCode, TError>): IAppError<TCode, TError>;
}
export interface IAppError<TCode extends string = string, TError extends number = number> extends Error {
    kind: Readonly<ErrorKind.AppError>;
    /**
     * The name of the APP which threw the error
     */
    app: Readonly<string>;
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
    errorCode?: Readonly<TError>;
}
/**
 * An Error thrown by a application. A string based "code" for the error can be added to errors
 * when throwing but isn't strictly required.
 */
export declare function createAppError<TCode extends string = string, TError extends number = number>(appName: string, defaultOptions?: IAppOptions<TCode, TError>): IAppErrorConstructor<TCode, TError>;
