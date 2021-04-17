import { DEFAULT_ERROR_CODE } from "../ErrorMeta";
import { IError } from "~/types";
import { getResponseHeaders } from "~/wrapper-fn";
import { IAwsApiGatewayResponse } from "common-types";
/**
 * **apiGatewayFailure**
 *
 * Converts an error into response structure that can be passed back via
 * AWS's API Gateway. The status code will use the `httpStatus` property of
 * the error if available but then fall back to the DEFAULT_ERROR_CODE.
 */
export function apiGatewayFailure(e: IError): IAwsApiGatewayResponse {
  return {
    isBase64Encoded: false,
    headers: getResponseHeaders(),
    statusCode: e.httpStatus || DEFAULT_ERROR_CODE,
    body: JSON.stringify({
      errorType: e.name || e.code || "Error",
      errorMessage: e.message,
    }),
  };
}
