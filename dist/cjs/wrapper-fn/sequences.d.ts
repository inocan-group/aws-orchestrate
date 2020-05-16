import { ILoggerApi } from "aws-log";
import { IAWSLambaContext } from "common-types";
import { LambdaSequence } from "../private";
/**
 * Adds a new sequence to be invoked later (as a call to `invokeNewSequence`)
 */
export declare function registerSequence(log: ILoggerApi, context: IAWSLambaContext): (s: LambdaSequence) => void;
/**
 * returns the sequence which was set by `startSequence()`
 **/
export declare function getNewSequence(): LambdaSequence;
export declare function invokeNewSequence(results?: any): Promise<import("aws-sdk/clients/lambda").InvocationResponse>;
