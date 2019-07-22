import { IAwsLogContext } from "aws-log";
import { IErrorWithExtraProperties } from "../@types";
export declare class HandledError extends Error {
    static apiGatewayError(errorCode: number, e: Error, context: IAwsLogContext): string;
    static lambdaError(errorCode: number, e: Error, context: IAwsLogContext): void;
    name: string;
    code: string;
    classification: string;
    functionName: string;
    httpStatus: number;
    requestId: string;
    constructor(errorCode: number, e: IErrorWithExtraProperties, context: IAwsLogContext);
}
