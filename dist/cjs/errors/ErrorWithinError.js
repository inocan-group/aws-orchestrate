"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorWithinError = void 0;
const common_types_1 = require("common-types");
const lodash_get_1 = __importDefault(require("lodash.get"));
/**
 * Errors which are encountered while handling an error. These secondary errors
 * should always originate from the **wrapper** function rather than the consumer's
 * _handler_ function.
 */
class ErrorWithinError extends Error {
    constructor(
    /** the original error */
    originalError, 
    /** the error encountered within the error handling section */
    secondaryErr) {
        super(originalError.message);
        this.name = "aws-orchestrate/error-handling";
        this.code = "error-handling";
        this.httpStatus = common_types_1.HttpStatusCodes.InternalServerError;
        this.message = `There was an error in the wrapper function while TRYING to handle another error. The original error had a message of: \n"${lodash_get_1.default(originalError, "message", "no message")}".\n\nSubsequently the error within the wrapper function was: "${lodash_get_1.default(secondaryErr, "message", "no message")}"`;
        this.stack = secondaryErr.stack;
        this.originalStack = originalError.stack;
    }
}
exports.ErrorWithinError = ErrorWithinError;
//# sourceMappingURL=ErrorWithinError.js.map