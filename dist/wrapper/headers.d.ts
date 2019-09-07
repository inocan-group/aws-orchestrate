import { IDictionary } from "common-types";
/**
 * Ensures that frontend clients who call Lambda's
 * will be given a CORs friendly response
 */
export declare const CORS_HEADERS: {
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Credentials": boolean;
};
export declare function getContentType(): string;
export declare function setContentType(type: string): void;
export declare function getHeaders(): IDictionary<string>;
/**
 * set the `correlationId` so it is always passed
 * as a header variable on responses and invocations
 */
export declare function setCorrelationId(cid: string): void;
export declare function getAllHeaders(): {
    "Content-Type": string;
    "x-correlation-id": string;
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Credentials": boolean;
};
export declare function setHeaders(headers: IDictionary<string>): void;
