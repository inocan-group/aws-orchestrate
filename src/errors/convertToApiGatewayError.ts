import { DEFAULT_ERROR_CODE } from "./ErrorMeta";
import { IApiGatewayErrorResponse } from "common-types";
import { getAllHeaders } from "../wrapper/headers";
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
export function convertToApiGatewayError(
  e: Error & { code?: string; errorCode?: number },
  defaultCode: number = DEFAULT_ERROR_CODE
): IApiGatewayErrorResponse {
  return {
    headers: getAllHeaders(),
    errorCode: e.errorCode || defaultCode,
    errorType: e.name || e.code || "Error",
    errorMessage: e.message,
    stackTrace: e.stack
  };
}
