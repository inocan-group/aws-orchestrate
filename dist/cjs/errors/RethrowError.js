"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const lodash_get_1 = __importDefault(require("lodash.get"));
/**
 * Rethrows an error which has a `code` property set
 * such as `HandledError` or `HandledError`; preserving
 * _code_, _name_, _httpStatus_, and _stack_.
 */
class RethrowError extends Error {
    constructor(err) {
        super(err.message);
        this.code = lodash_get_1.default(err, "code");
        this.name = lodash_get_1.default(err, "name");
        this.stack = lodash_get_1.default(err, "stack");
        this.type = lodash_get_1.default(err, "type");
        this.httpStatus = lodash_get_1.default(err, "httpStatus", common_types_1.HttpStatusCodes.InternalServerError);
    }
}
exports.RethrowError = RethrowError;
//# sourceMappingURL=RethrowError.js.map