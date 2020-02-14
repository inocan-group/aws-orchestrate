/**
 * Allows the definition of a serverless function's
 * expected error code
 */
export class ErrorHandler {
    constructor(code, identifiedBy, handling) {
        this.code = code;
        this.identifiedBy = identifiedBy;
        this.handling = handling;
    }
    toString() {
        return {
            code: this.code,
            identifiedBy: this.identifiedBy,
            handling: this.handling
        };
    }
}
//# sourceMappingURL=ErrorHandler.js.map