import { DEFAULT_ERROR_CODE } from "./ErrorMeta";
import { IApiGatewayErrorResponse } from "common-types";
import { getResponseHeaders } from "../wrapper-fn/headers";
import { IErrorClass } from "../@types";
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
      stackTrace: e.stack
    })
  };
}
