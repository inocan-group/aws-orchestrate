import { LambdaSequence } from "../LambdaSequence";
import { ILoggerApi, invoke } from "aws-log";
import { IAWSLambaContext } from "common-types";

let sequence: LambdaSequence;

export function startSequence(log: ILoggerApi, context: IAWSLambaContext) {
  return (sequence: LambdaSequence) => {
    log.info(
      `This function [ ${context.functionName} ] will kick off a new sequence with ${sequence.steps.length} steps.`,
      { sequence }
    );
  };
}

export async function invokeNewSequence(results: any = {}, log: ILoggerApi) {
  if (!sequence) {
    return;
  }
  results = results || {};
  await invoke(
    ...sequence.next(typeof results === "object" ? results : { data: results })
  );
  log.info(`The new sequence has been kicked off`);
}
