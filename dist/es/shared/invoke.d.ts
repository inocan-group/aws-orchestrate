import { IDictionary } from "common-types";
import { LambdaSequence } from "../private";
declare type InvocationResponse = import("aws-sdk").Lambda.InvocationResponse;
export declare type LambdaInvocation<T = IDictionary, H = UnconstrainedHttpHeaders> = (fnArn: string, request: T, additionalHeaders?: H) => Promise<InvocationResponse>;
export declare type UnconstrainedHttpHeaders = IDictionary<string | number | boolean>;
/**
 * A higher-order function which accepts a _sequence_ as an input first.
 * In essence, this just provides useful configuration which the _wrapper
 * function_ can provide and then it passes the remaining function down
 * to the consumer of this library to use in the handler function (aka, as
 * part of the `context` object passed into the handler).
 *
 * Calling the first function returns a _invocation_ function which just
 * takes the ARN and request params (optionally allowing additional
 * _headers_ too).
 */
export declare function invoke(sequence: LambdaSequence): <T = IDictionary<any>, H = UnconstrainedHttpHeaders>(fnArn: string, request: T, additionalHeaders?: H) => Promise<import("aws-sdk/clients/lambda").InvocationResponse>;
export {};
