import { LambdaSequence } from "../LambdaSequence";
import { ILoggerApi } from "aws-log";
import { IAWSLambaContext } from "common-types";
import { invoke } from "../invoke";

let newSequence: LambdaSequence;

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
  return newSequence || LambdaSequence.notASequence();
}

export async function invokeNewSequence(results: any = {}) {
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
