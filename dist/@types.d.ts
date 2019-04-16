import { IDictionary, IAWSLambdaProxyIntegrationRequest } from "common-types";
import { LambdaSequence } from "./LambdaSequence";
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
