"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrchestratedRequest = void 0;
const LambdaSequence_1 = require("../LambdaSequence");
const wrapper_fn_1 = require("../wrapper-fn");
const compress_1 = require("./compress");
function buildOrchestratedRequest(body, sequence, 
/**
 * By default this function will include all _request headers_
 * such as the forwarding of _secrets_ but if you want to include
 * additional ones they can be added with this parameter.
 */
additionalHeaders) {
    if (!sequence) {
        sequence = LambdaSequence_1.LambdaSequence.notASequence();
    }
    const headers = additionalHeaders
        ? Object.assign(Object.assign({}, wrapper_fn_1.getRequestHeaders()), additionalHeaders) : wrapper_fn_1.getRequestHeaders();
    return {
        type: "orchestrated-message-body",
        body: compress_1.compress(body, 4096),
        sequence: compress_1.compress(sequence.toObject(), 4096),
        headers: compress_1.compress(headers, 4096)
    };
}
exports.buildOrchestratedRequest = buildOrchestratedRequest;
//# sourceMappingURL=buildOrchestratedRequest.js.map