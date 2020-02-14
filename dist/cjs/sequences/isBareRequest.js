"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const isOrchestratedMessageBody_1 = require("./isOrchestratedMessageBody");
function isBareRequest(event) {
    return !common_types_1.isLambdaProxyRequest(event) && !isOrchestratedMessageBody_1.isOrchestratedRequest(event)
        ? true
        : false;
}
exports.isBareRequest = isBareRequest;
//# sourceMappingURL=isBareRequest.js.map