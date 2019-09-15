import { LambdaSequence } from "../LambdaSequence";
import { ILoggerApi, invoke } from "aws-log";
import { IAWSLambaContext } from "common-types";

// default to NOT a sequence
let newSequence: LambdaSequence = LambdaSequence.notASequence();

/**
 * Adds a new sequence to be invoked later (as a call to `invokeNewSequence`)
 */
export function registerSequence(log: ILoggerApi, context: IAWSLambaContext) {
  return (s: LambdaSequence) => {
    log.debug(
      `This function has registered a new sequence with ${s.steps.length} steps to be kicked off as part of this function's execution.`,
      { sequence: s.toObject() }
    );
    newSequence = s;
  };
}

/**
 * returns the sequence which was set by `startSequence()`
 **/
export function getNewSequence() {
  return newSequence;
}

export async function invokeNewSequence(results: any = {}, log: ILoggerApi) {
  if (!newSequence) {
    return;
  }
  results = results || {};
  const response = await invoke(
    ...newSequence.next(
      typeof results === "object" ? results : { data: results }
    )
  );
  return response;
}
