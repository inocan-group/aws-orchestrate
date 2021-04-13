import { Cookie, IDictionary, IHttpResponseHeaders } from "common-types";
import { getCorrelationId, logger } from "aws-log";
import { set } from "native-dash";
import { getLocalSecrets, saveSecretsLocally } from "./secrets";
import { ICookieOptions, IOrchestratedHeaders } from "~/types";

/**
 * Ensures that frontend clients who call Lambda's
 * will be given a CORs friendly response
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

let contentType = "application/json";
let functionHeaders: IDictionary<string> = {};
const cookies: Cookie[] = [];

/**
 * Publish all saved cookies as a CR delimited header string.
 *
 * Note: this must be done in this format because it can not be represented as a
 * dictionary because each cookie has the same key value of `Set-Cookie`.
 */
export function publishCookies() {
  return cookies.length > 0 ? cookies.map((i) => `Set-Cookie: ${i}`).join("\n") : "";
}

/**
 * The currently set content-type for API-Gateway callers
 */
export function getContentType() {
  return contentType;
}

/**
 * By passing in all the headers you received in a given
 * invocation this function will pull out all the headers
 * which start with `O-S-` (as this is the convention for
 * secrets passed by `aws-orchestrate`). Each line item in
 * a header represents a secret name/value pairing. For instance,
 * A typical header might be keyed with `O-S-firemodel/SERVICE_ACCOUNT`.
 *
 * Each header name/value will be parsed and then stored in following format:
 *
 * ```typescript
 * {
 *    [module1]: {
 *      secret1: value,
 *      secret2: value
 *    },
 *    [module2]: {
 *      secret3: value
 *    }
 * }
 * ```
 *
 * This format is consistent with the opinionated format established by
 * the `aws-ssm` library. This data structure can be retrieved at any
 * point by a call to `getLocalSecrets()`.
 *
 * @returns boolean returns true/false based on whether any secrets were found
 */
export function setSecretHeaders(headers: IDictionary): boolean {
  const secrets: string[] = [];
  const localSecrets = Object.keys(headers).reduce((headerSecrets: IDictionary, key: keyof typeof headers & string) => {
    if (key.slice(0, 4) === "O-S-") {
      const [module, name] = key.slice(4).split("/");
      const dotPath = `${module}.${name}`;
      set(headerSecrets, dotPath, headers[key]);
      secrets.push(dotPath);
    }
    return headerSecrets;
  }, {});

  saveSecretsLocally(localSecrets);
  return secrets.length > 0;
}

/**
 * Takes all of the saved local secrets and puts them into the right format
 * for being passed in the header of forwarding invocation.
 */
export function getHeaderSecrets() {
  const log = logger().reloadContext();
  const modules = getLocalSecrets();
  return Object.keys(modules).reduce((headerSecrets: IDictionary, module: keyof typeof modules & string) => {
    const secrets = modules[module];
    if (typeof secrets === "object") {
      for (const secret of Object.keys(secrets)) {
        headerSecrets[`O-S-${module}/${secret}`] = modules[module][secret];
      }
    } else {
      log.warn(
        `Attempt to generate header secrets but module "${module}" is not a hash of name/values. Ignoring this module but continuing.`,
        {
          module: module,
          type: typeof secrets,
          localModules: Object.keys(modules),
        }
      );
    }

    return headerSecrets;
  }, {});
}

export function setContentType(type: string) {
  if (!type.includes("/")) {
    throw new Error(`The value sent to setContentType ("${type}") is not valid; it must be a valid MIME type.`);
  }

  contentType = type;
}

/**
 * Get the user/developer defined headers for this function
 */
export function getUserHeaders() {
  return functionHeaders;
}

export function setUserHeaders(headers: IDictionary<string>) {
  if (typeof headers !== "object") {
    throw new TypeError(
      `The value sent to setHeaders is not the required type. Was "${typeof headers}"; expected "object".`
    );
  }

  functionHeaders = headers;
}

function getBaseHeaders(more?: IHttpResponseHeaders) {
  return {
    ...(more ? more : {}),
    ...getUserHeaders(),
    "X-Correlation-Id": getCorrelationId(),
  };
}

/**
 * All the HTTP _Response_ headers to send when returning to API Gateway
 */
export function getResponseHeaders(options: IHttpResponseHeaders = {}): IOrchestratedHeaders {
  return {
    ...getBaseHeaders(options),
    ...CORS_HEADERS,
    "Content-Type": getContentType(),
  };
}

/**
 * All the HTTP _Request_ headers to send when calling
 * another function
 */
export function getRequestHeaders(options: IHttpResponseHeaders = {}): IOrchestratedHeaders {
  return {
    ...getHeaderSecrets(),
    ...getBaseHeaders(options),
  };
}

/**
 * Set a cookie header for caller to hopefully accept on receipt
 *
 */
export function addCookie(name: string, value: string, options: ICookieOptions = {}) {
  let cookie = `${name}=${value}`;
  if (options.expires) {
    cookie += "; Expires=${expires}";
  }
  if (options.maxAge) {
    cookie += `; Max-Age: ${options.maxAge}`;
  }
  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  cookies.push(cookie as Cookie);
}
