import { LambdaSequence } from "../LambdaSequence";
import { ISequenceTrackerStatus } from "../exported-functions/SequenceTracker";
import { IErrorClass } from "../@types";
/**
 * Reduces a sequence object to a simple "status" based representation
 */
export declare const sequenceStatus: <T = any>(correlationId: string) => (s: LambdaSequence, dataOrError?: T | IErrorClass) => ISequenceTrackerStatus;
