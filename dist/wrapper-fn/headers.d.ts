import { IDictionary, IHttpResponseHeaders } from "common-types";
import { IWrapperResponseHeaders } from "../@types";
/**
 * Ensures that frontend clients who call Lambda's
 * will be given a CORs friendly response
 */
export declare const CORS_HEADERS: {
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Credentials": boolean;
};
export declare function getContentType(): string;
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
export declare function saveSecretHeaders(headers: IDictionary): IDictionary<any>;
/**
 * Takes all of the saved local secrets and puts them into the right format
 * for being passed in the header of forwarding invocation.
 */
export declare function getHeaderSecrets(): IDictionary<any>;
export declare function setContentType(type: string): void;
/**
 * Get the user/developer defined headers for this function
 */
export declare function getFnHeaders(): IDictionary<string>;
export declare function setFnHeaders(headers: IDictionary<string>): void;
/**
 * All the HTTP _Response_ headers to send when returning to API Gateway
 */
export declare function getResponseHeaders(opts?: IHttpResponseHeaders): IWrapperResponseHeaders;
/**
 * All the HTTP _Request_ headers to send when calling
 * another function
 */
export declare function getRequestHeaders(opts?: IHttpResponseHeaders): IWrapperResponseHeaders;
