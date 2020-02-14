"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnhandledError extends Error {
    /**
     * **Constructor**
     *
     * @param errorCode the numeric HTTP error code
     * @param e the error which wasn't handled
     * @param classification the type/subtype of the error; if only `subtype` stated then
     * type will be defaulted to `unhandled-error`
     */
    constructor(errorCode, e, classification) {
        super(e.message);
        this.type = "unhandled-error";
        this.stack = e.stack;
        classification = classification || `unhandled-error/${e.name || e.code}`;
        classification = classification.includes("/") ? classification : `unhandled-error/${classification}`;
        const [type, subType] = classification.split("/");
        this.name = type;
        this.code = subType;
        this.httpStatus = errorCode;
    }
}
exports.UnhandledError = UnhandledError;
//# sourceMappingURL=UnhandledError.js.map