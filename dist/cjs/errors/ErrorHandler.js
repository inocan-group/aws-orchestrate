"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
/**
 * Allows the definition of a serverless function's
 * expected error code
 */
class ErrorHandler {
    constructor(code, identifiedBy, handling) {
        this.code = code;
        this.identifiedBy = identifiedBy;
        this.handling = handling;
    }
    toString() {
        return {
            code: this.code,
            identifiedBy: this.identifiedBy,
            handling: this.handling,
        };
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map