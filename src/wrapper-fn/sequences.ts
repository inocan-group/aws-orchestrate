import { ILoggerApi } from "aws-log";
import { IAWSLambaContext } from "common-types";
import { LambdaSequence } from "~/LambdaSequence";

let newSequence: LambdaSequence;

/**
 * Adds a new sequence to be invoked later (as a call to `invokeNewSequence`)
 */
export function registerSequence(log: ILoggerApi, context: IAWSLambaContext) {
  return (s: LambdaSequence) => {
    log.debug(
      `This function has registered a new sequence with ${s.steps.length} steps to be kicked off as part of this function's execution.`,
      { sequence: s.toObject(), context }
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

export async function invokeNewSequence() {
  if (!newSequence) {
    return;
  }
  const response = await newSequence.start();
  return response;
}
