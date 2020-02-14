import { IApiGatewayErrorResponse } from "common-types";
import { IErrorClass } from "../@types";
/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */
export declare function convertToApiGatewayError(e: IErrorClass, defaultCode?: number): IApiGatewayErrorResponse;
