import { HttpStatusCodes } from "common-types";
/**
 * Thrown when a function calls itself more than the allowed `callDepth`
 * setting allows for.
 */
export class CallDepthExceeded extends Error {
    constructor(callDepth) {
        super("");
        this.name = "aws-orchestrate/call-depth-exceeded";
        this.code = "call-depth-exceeded";
        this.httpStatus = HttpStatusCodes.InternalServerError;
        this.message = `The allowed number of self-calls [ ] was exceeded!"`;
    }
}
//# sourceMappingURL=CallDepthExceeded.js.map