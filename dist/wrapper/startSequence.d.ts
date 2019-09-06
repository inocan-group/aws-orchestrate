import { LambdaSequence } from "../LambdaSequence";
import { ILoggerApi } from "aws-log";
import { IAWSLambaContext } from "common-types";
export declare function startSequence(log: ILoggerApi, context: IAWSLambaContext): (sequence: LambdaSequence) => void;
export declare function invokeNewSequence(results: any, log: ILoggerApi): Promise<void>;
