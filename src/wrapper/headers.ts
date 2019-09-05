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

export function setHeaders(headers: IDictionary<string>) {
  if (typeof headers !== "object") {
    throw new Error(
      `The value sent to setHeaders is not the required type. Was "${typeof headers}"; expected "object".`
    );
  }
  fnHeaders = headers;
}
