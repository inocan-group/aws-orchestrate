import { IAwsApiGatewayResponse } from "common-types";
import { IApiGatewaySuccessOptions } from "~/types/api-gateway";
import { getResponseHeaders } from "../headers";
import { getStatusCode } from "../statusCode";

/**
 * **apiGatewaySuccess**
 *
 * Takes a handler's response and returns it in a way that it can be passed through
 * AWS's API Gateway. This call will ensure that the following headers are set:
 *
 * - CORS
 * - Content-Type
 * - X-Correlation-Id
 *
 * **Note 1:** _if the body passed in is _not_ a string and the default response type of "application/json" is
 * being used, this function will use `JSON.parse()` to convert it to a string_
 */
export function apiGatewaySuccess(body: any, options: IApiGatewaySuccessOptions = {}): IAwsApiGatewayResponse {
  const headers = { ...getResponseHeaders(), ...(options.headers ? options.headers : {}) };
  if (typeof body !== "string" && headers["Content-Type"] === "application/json") {
    body = JSON.parse(body);
  }

  const statusCode: number = getStatusCode() || (!body && body !== false) ? 204 : 200;

  return {
    isBase64Encoded: options.base64Encode || false,
    statusCode,
    body,
  };
}
