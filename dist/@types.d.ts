import { IDictionary, IAWSLambdaProxyIntegrationRequest, IAWSLambaContext } from "common-types";
import { LambdaSequence } from "./LambdaSequence";
import { ILoggerApi } from "aws-log";
import { ErrorMeta } from "./ErrorMeta";
import { IGetSecrets } from "./wrapper/getSecrets";
export interface ILambdaSequenceStep<T = IDictionary> {
    arn: string;
    params: Partial<T>;
    type: ILambdaFunctionType;
    status: "assigned" | "active" | "completed";
    results?: T;
}
export declare type ILambdaFunctionType = "task" | "fan-out" | "step-start" | "fan-in" | "other";
export declare type Sequence<T> = T & {
    _sequence: ILambdaSequenceStep[];
};
export interface ILambaSequenceFromResponse<T> {
    request: T;
    apiGateway?: IAWSLambdaProxyIntegrationRequest;
    sequence: LambdaSequence;
}
export declare type ILambdaSequenceNextTuple<T> = [string, Sequence<T>];
export interface IErrorIdentification {
    errorClass?: new (...args: any) => Error;
    code?: string;
    name?: string;
    messageContains?: string;
}
export declare type arn = string;
export interface IErrorHandling {
    forwardTo?: arn;
    callback?: (e: Error) => boolean;
}
export interface IErrorHandlingDefault {
    defaultHandling: true;
}
export interface IHandlerContext<T> extends IAWSLambaContext {
    sequence: LambdaSequence;
    isSequence: boolean;
    isDone: boolean;
    log: ILoggerApi;
    getSecrets: IGetSecrets<T>;
    apiGateway: IAWSLambdaProxyIntegrationRequest;
    isApiGatewayRequest: boolean;
    errorMeta: ErrorMeta;
}
export declare type IHandlerFunction<E, R> = (event: E, context: IHandlerContext<E>) => Promise<R>;
export interface IErrorWithExtraProperties extends Error {
    [key: string]: any;
}
