import { IDictionary } from "common-types";

/**
 * Ensures that frontend clients who call Lambda's
 * will be given a CORs friendly response
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

let contentType = "application/json";
let fnHeaders: IDictionary<string> = {};
let correlationId: string;

export function getContentType() {
  return contentType;
}

export function setContentType(type: string) {
  if (!type.includes("/")) {
    throw new Error(
      `The value sent to setContentType ("${type}") is not valid; it must be a valid MIME type.`
    );
  }
  contentType = type;
}

export function getHeaders() {
  return fnHeaders;
}

/**
 * set the `correlationId` so it is always passed
 * as a header variable on responses and invocations
 */
export function setCorrelationId(cid: string) {
  correlationId = cid;
}

export function getAllHeaders() {
  return {
    ...CORS_HEADERS,
    ...getHeaders(),
    "Content-Type": getContentType(),
    "x-correlation-id": correlationId
  };
}

export function setHeaders(headers: IDictionary<string>) {
  if (typeof headers !== "object") {
    throw new Error(
      `The value sent to setHeaders is not the required type. Was "${typeof headers}"; expected "object".`
    );
  }
  fnHeaders = headers;
}
