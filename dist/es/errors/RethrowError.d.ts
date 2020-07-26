import { IErrorClass } from "../@types";
/**
 * Rethrows an error which has a `code` property set
 * such as `HandledError` or `HandledError`; preserving
 * _code_, _name_, _httpStatus_, and _stack_.
 */
export declare class RethrowError extends Error {
    code: string;
    httpStatus: number;
    type: string;
    constructor(err: IErrorClass);
}
