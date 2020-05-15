"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOrchestratedRequest = void 0;
/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IOrchestratedMessageBody`
 */
function isOrchestratedRequest(msg) {
    return typeof msg === "object" &&
        msg.type === "orchestrated-message-body"
        ? true
        : false;
}
exports.isOrchestratedRequest = isOrchestratedRequest;
//# sourceMappingURL=isOrchestratedMessageBody.js.map