import { ErrorKind, IBaseErrorOptions } from "./types";
export declare type ILibraryOptions<TCode extends string = string, TError extends number = number> = IBaseErrorOptions<TCode, TError>;
export interface ILibraryErrorConstructor<TCode extends string = string, TError extends number = number> {
    new (message: string, code: TCode, options?: ILibraryOptions<TCode, TError>): ILibraryError<TCode, TError>;
}
export interface ILibraryError<TCode extends string = string, TError extends number = number> extends Error {
    kind: Readonly<ErrorKind.LibraryError>;
    /**
     * The name of the library which threw the error
     */
    library: Readonly<string>;
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
export declare function createLibraryError<TCode extends string = string, TError extends number = number>(
/**
 * The library's name
 */
library: string, 
/**
 * Default options
 */
defaultOptions?: ILibraryOptions<TCode, TError>): ILibraryErrorConstructor<TCode, TError>;
