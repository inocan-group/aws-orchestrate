import { IApiGatewayErrorResponse } from "common-types";
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
export declare function convertToApiGatewayError(e: Error & {
    code?: string;
    errorCode?: number;
}, defaultCode?: number): IApiGatewayErrorResponse;
