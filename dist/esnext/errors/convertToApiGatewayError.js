import { DEFAULT_ERROR_CODE } from "./ErrorMeta";
import { getResponseHeaders } from "../wrapper-fn/headers";
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
export function convertToApiGatewayError(e, defaultCode = DEFAULT_ERROR_CODE) {
    return {
        isBase64Encoded: false,
        headers: getResponseHeaders(),
        statusCode: e.errorCode || e.httpStatus || defaultCode,
        body: JSON.stringify({
            errorType: e.name || e.code || "Error",
            errorMessage: e.message,
            stackTrace: e.stack
        })
    };
}
//# sourceMappingURL=convertToApiGatewayError.js.map