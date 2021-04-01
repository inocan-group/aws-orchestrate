import { getResponseHeaders } from "../wrapper-fn/headers";
import { IErrorClass } from "../@types";
import { DEFAULT_ERROR_CODE } from "./ErrorMeta";
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
export function convertToApiGatewayError(e: IErrorClass, defaultCode: number = DEFAULT_ERROR_CODE): any {
  return {
    isBase64Encoded: false,
    headers: getResponseHeaders(),
    statusCode: e.errorCode || e.httpStatus || defaultCode,
    body: JSON.stringify({
      errorType: e.name || e.code || "Error",
      errorMessage: e.message,
      stackTrace: e.stack,
    }),
  };
}
