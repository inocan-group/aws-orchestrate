import { ErrorMeta, ErrorHandler } from "../private";
/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 * If _not_ found then return `false`.
 */
export declare function findError(e: Error & {
    code?: string;
}, expectedErrors: ErrorMeta): false | ErrorHandler;
