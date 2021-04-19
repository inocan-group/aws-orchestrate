"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsmError = void 0;
class SsmError extends Error {
    constructor(code, message) {
        super();
        this.message = message;
        this.code = code;
        this.name = "SsmError";
    }
}
exports.SsmError = SsmError;
//# sourceMappingURL=SsmError.js.map