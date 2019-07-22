import { ErrorHandler } from "../ErrorHandler";
import { ErrorMeta } from "../ErrorMeta";
export declare function findError(e: Error & {
    code?: string;
}, expectedErrors: ErrorMeta): false | ErrorHandler;
