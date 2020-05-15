"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandledError = void 0;
class HandledError extends Error {
    /**
     * **Constructor**
     *
     * @param errorCode the numeric HTTP error code
     * @param e the error which wasn't handled
     * @param classification the type/subtype of the error; if only `subtype` stated then
     * type will be defaulted to `handled-error`
     */
    constructor(errorCode, e, context) {
        super(e.message);
        this.type = "handled-error";
        this.stack = e.stack;
        const type = e.name && e.name !== "Error" ? e.name : context.functionName;
        const subType = e.code ? String(e.code) : "handled-error";
        this.classification = `${type}/${subType}`;
        this.functionName = context.functionName;
        this.name = type;
        this.code = subType;
        this.httpStatus = errorCode;
    }
    /**
     * Create a serialized/string representation of the error
     * for returning to **API Gateway**
     */
    static apiGatewayError(errorCode, e, context) {
        const obj = new HandledError(errorCode, e, context);
        return JSON.stringify({
            errorType: obj.name,
            httpStatus: obj.httpStatus,
            requestId: obj.requestId,
            message: obj.message
        });
    }
    /**
     * creates an error to be thrown by a **Lambda** function which
     * was initiatiated by a
     */
    static lambdaError(errorCode, e, context) {
        const obj = new HandledError(errorCode, e, context);
    }
}
exports.HandledError = HandledError;
//# sourceMappingURL=HandledError.js.map