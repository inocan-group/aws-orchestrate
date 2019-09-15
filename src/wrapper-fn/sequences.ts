import { LambdaSequence } from "../LambdaSequence";
import { ILoggerApi, invoke } from "aws-log";
import { IAWSLambaContext } from "common-types";
import { loggedMessages } from "./loggedMessages";

// default to NOT a sequence
let sequence: LambdaSequence = LambdaSequence.notASequence();

/**
 * Adds a new sequence to be invoked later (as a call to `invokeNewSequence`)
 */
export function registerSequence(log: ILoggerApi, context: IAWSLambaContext) {
  return (s: LambdaSequence) => {
    loggedMessages(log).newSequenceRegistered();
    sequence = s;
  };
}

/** returns the sequence which was set by `startSequence()` */
export function getNewSequence() {
  return sequence;
}

export async function invokeNewSequence(results: any = {}, log: ILoggerApi) {
  if (!sequence) {
    return;
  }
  results = results || {};
  const response = await invoke(
    ...sequence.next(typeof results === "object" ? results : { data: results })
  );
  return response;
}
