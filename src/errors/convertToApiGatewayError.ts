import { DEFAULT_ERROR_CODE } from "./ErrorMeta";
import { IApiGatewayErrorResponse } from "common-types";
import { getResponseHeaders } from "../wrapper-fn/headers";
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
export function convertToApiGatewayError(
  e: Error & { code?: string; errorCode?: number },
  defaultCode: number = DEFAULT_ERROR_CODE
): IApiGatewayErrorResponse {
  return {
    headers: getResponseHeaders(),
    errorCode: e.errorCode || defaultCode,
    errorType: e.name || e.code || "Error",
    errorMessage: e.message,
    stackTrace: e.stack
  };
}