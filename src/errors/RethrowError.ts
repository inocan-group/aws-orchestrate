import { HttpStatusCodes } from "common-types";
import get = require("lodash.get");

/**
 * Rethrows an error which has a `code` property set
 * such as `HandledError` or `HandledError`; preserving
 * _code_, _name_, _httpStatus_, and _stack_.
 */
export class RethrowError extends Error {
  public code: string;
  public httpStatus: number;

  constructor(e) {
    super(e);

    this.code = get(e, "code");
    this.name = get(e, "name");
    this.stack = get(e, "stack");
    this.httpStatus = get(e, "httpStatus", HttpStatusCodes.InternalServerError);
  }
}
