import { ErrorHandler } from "../ErrorHandler";
import { ErrorMeta } from "../errors/ErrorMeta";
export declare function findError(e: Error & {
    code?: string;
}, expectedErrors: ErrorMeta): false | ErrorHandler;
