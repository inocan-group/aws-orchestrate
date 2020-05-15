"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToApiGatewayError = void 0;
const ErrorMeta_1 = require("./ErrorMeta");
const headers_1 = require("../wrapper-fn/headers");
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
function convertToApiGatewayError(e, defaultCode = ErrorMeta_1.DEFAULT_ERROR_CODE) {
    return {
        isBase64Encoded: false,
        headers: headers_1.getResponseHeaders(),
        statusCode: e.errorCode || e.httpStatus || defaultCode,
        body: JSON.stringify({
            errorType: e.name || e.code || "Error",
            errorMessage: e.message,
            stackTrace: e.stack
        })
    };
}
exports.convertToApiGatewayError = convertToApiGatewayError;
//# sourceMappingURL=convertToApiGatewayError.js.map