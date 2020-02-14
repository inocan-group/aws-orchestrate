import { LambdaSequence } from "../LambdaSequence";
import { ISequenceTrackerStatus } from "../exported-functions/SequenceTracker";
import { IErrorClass } from "../@types";
/**
 * A higher order function which first takes a `correlationId` and returns a function which provides
 * a simple status of the sequence.
 */
export declare const sequenceStatus: <T = any>(correlationId: string) => (s: LambdaSequence, dataOrError?: IErrorClass | T) => ISequenceTrackerStatus;
