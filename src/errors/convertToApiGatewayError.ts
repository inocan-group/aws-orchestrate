import { DEFAULT_ERROR_CODE } from "./ErrorMeta";
import { IApiGatewayErrorResponse } from "common-types";
import { getResponseHeaders } from "../wrapper-fn/headers";
import { IErrorClass } from "../@types";
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
export function convertToApiGatewayError(
  e: IErrorClass,
  defaultCode: number = DEFAULT_ERROR_CODE
): IApiGatewayErrorResponse {
  return {
    headers: getResponseHeaders(),
    errorCode: e.errorCode || e.httpStatus || defaultCode,
    errorType: e.name || e.code || "Error",
    errorMessage: e.message,
    stackTrace: e.stack
  };
}
