"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
/**
 * Thrown when a function calls itself more than the allowed `callDepth`
 * setting allows for.
 */
class CallDepthExceeded extends Error {
    constructor(callDepth) {
        super("");
        this.name = "aws-orchestrate/call-depth-exceeded";
        this.code = "call-depth-exceeded";
        this.httpStatus = common_types_1.HttpStatusCodes.InternalServerError;
        this.message = `The allowed number of self-calls [ ] was exceeded!"`;
    }
}
exports.CallDepthExceeded = CallDepthExceeded;
//# sourceMappingURL=CallDepthExceeded.js.map