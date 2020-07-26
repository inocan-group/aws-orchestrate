import { isLambdaProxyRequest } from "common-types";
import { isOrchestratedRequest } from "./isOrchestratedMessageBody";
export function isBareRequest(event) {
    return !isLambdaProxyRequest(event) && !isOrchestratedRequest(event)
        ? true
        : false;
}
//# sourceMappingURL=isBareRequest.js.map