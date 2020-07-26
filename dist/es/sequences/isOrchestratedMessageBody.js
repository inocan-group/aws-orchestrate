/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IOrchestratedMessageBody`
 */
export function isOrchestratedRequest(msg) {
    return typeof msg === "object" &&
        msg.type === "orchestrated-message-body"
        ? true
        : false;
}
//# sourceMappingURL=isOrchestratedMessageBody.js.map