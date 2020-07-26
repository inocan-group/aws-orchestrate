import { LambdaSequence } from "../LambdaSequence";
import { getRequestHeaders } from "../wrapper-fn";
import { compress } from "./compress";
export function buildOrchestratedRequest(body, sequence, 
/**
 * By default this function will include all _request headers_
 * such as the forwarding of _secrets_ but if you want to include
 * additional ones they can be added with this parameter.
 */
additionalHeaders) {
    if (!sequence) {
        sequence = LambdaSequence.notASequence();
    }
    const headers = additionalHeaders
        ? { ...getRequestHeaders(), ...additionalHeaders }
        : getRequestHeaders();
    return {
        type: "orchestrated-message-body",
        body: compress(body, 4096),
        sequence: compress(sequence.toObject(), 4096),
        headers: compress(headers, 4096)
    };
}
//# sourceMappingURL=buildOrchestratedRequest.js.map