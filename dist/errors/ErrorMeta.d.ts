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
    message?: IErrorMessageControl<T>;
    isDefault?: boolean;
}
export declare class ErrorMeta {
    private _errors;
    private _defaultErrorCode;
    private _arn;
    add(code: number, identifiedBy: IErrorIdentification, handling?: IErrorHandling): void;
    readonly list: ErrorHandler[];
    setDefaultErrorCode(code: number): this;
    setDefaultHandlerFunction(arn: string): this;
    readonly defaultErrorCode: number;
    toString(): string;
}
