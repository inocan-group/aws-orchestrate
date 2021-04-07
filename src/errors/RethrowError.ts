import { HttpStatusCodes } from "common-types";
import { IErrorClass } from "~/types";

/**
 * Rethrows an error which has a `code` property set
 * such as `HandledError` or `HandledError`; preserving
 * _code_, _name_, _httpStatus_, and _stack_.
 */
export class RethrowError extends Error {
  public code: string;
  public httpStatus: number;
  public type: string;

  constructor(err: IErrorClass) {
    super(err.message);

    this.code = err.code || process.env.DEFAULT_ERROR_CODE || "unknown";
    this.name = err.name;
    this.stack = err.stack;
    this.type = err.type || process.env.DEFAULT_ERROR_TYPE || "unknown";
    this.httpStatus = err.httpStatus ?? HttpStatusCodes.InternalServerError;
  }
}
