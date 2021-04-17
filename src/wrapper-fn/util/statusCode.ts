let statuscode: number | undefined;

/**
 * Get's the user's defined _successful_ status code
 * which may be _undefined_ as they are not required to set one.
 */
export function getStatusCode(): number | undefined {
  return statuscode;
}

/**
 * By default, the wrapper function will return a `200` or `204` statusCode
 * response to API Gateway callers but if you wish to change this to something
 * else you can.
 */
export function setStatusCode(code: number) {
  statuscode = code;
}
