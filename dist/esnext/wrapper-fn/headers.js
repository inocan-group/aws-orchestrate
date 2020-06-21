import { getCorrelationId, logger } from "aws-log";
import { getLocalSecrets, saveSecretsLocally, sequenceStatus } from "../private";
import { set } from "lodash-es";
/**
 * Ensures that frontend clients who call Lambda's
 * will be given a CORs friendly response
 */
export const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
};
let contentType = "application/json";
let fnHeaders = {};
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
 */
export function saveSecretHeaders(headers, log) {
    let secrets = [];
    const localSecrets = Object.keys(headers).reduce((headerSecrets, key) => {
        if (key.slice(0, 4) === `O-S-`) {
            const [module, name] = key.slice(4).split("/");
            const dotPath = `${module}.${name}`;
            set(headerSecrets, dotPath, headers[key]);
            secrets.push(dotPath);
        }
        return headerSecrets;
    }, {});
    if (secrets.length > 0) {
        log.debug(`Secrets [ ${secrets.length} ] from headers were identified`, {
            secrets,
        });
    }
    saveSecretsLocally(localSecrets);
    return localSecrets;
}
/**
 * Takes all of the saved local secrets and puts them into the right format
 * for being passed in the header of forwarding invocation.
 */
export function getHeaderSecrets() {
    const log = logger().reloadContext();
    const modules = getLocalSecrets();
    return Object.keys(modules).reduce((headerSecrets, mod) => {
        const secrets = modules[mod];
        if (typeof secrets === "object") {
            Object.keys(secrets).forEach((secret) => {
                headerSecrets[`O-S-${mod}/${secret}`] = modules[mod][secret];
            });
        }
        else {
            log.warn(`Attempt to generate header secrets but module "${mod}" is not a hash of name/values. Ignoring this module but continuing.`, {
                module: mod,
                type: typeof secrets,
                localModules: Object.keys(modules),
            });
        }
        return headerSecrets;
    }, {});
}
export function setContentType(type) {
    if (!type.includes("/")) {
        throw new Error(`The value sent to setContentType ("${type}") is not valid; it must be a valid MIME type.`);
    }
    contentType = type;
}
/**
 * Get the user/developer defined headers for this function
 */
export function getFnHeaders() {
    return fnHeaders;
}
export function setFnHeaders(headers) {
    if (typeof headers !== "object") {
        throw new Error(`The value sent to setHeaders is not the required type. Was "${typeof headers}"; expected "object".`);
    }
    fnHeaders = headers;
}
function getBaseHeaders(opts) {
    const correlationId = getCorrelationId();
    const sequenceInfo = opts.sequence
        ? {
            ["O-Sequence-Status"]: JSON.stringify(sequenceStatus(correlationId)(opts.sequence)),
        }
        : {};
    return {
        ...sequenceInfo,
        ...getFnHeaders(),
        ["X-Correlation-Id"]: getCorrelationId(),
    };
}
/**
 * All the HTTP _Response_ headers to send when returning to API Gateway
 */
export function getResponseHeaders(opts = {}) {
    return {
        ...getBaseHeaders(opts),
        ...CORS_HEADERS,
        "Content-Type": getContentType(),
    };
}
/**
 * All the HTTP _Request_ headers to send when calling
 * another function
 */
export function getRequestHeaders(opts = {}) {
    return {
        ...getHeaderSecrets(),
        ...getBaseHeaders(opts),
    };
}
//# sourceMappingURL=headers.js.map