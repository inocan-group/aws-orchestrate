import { LambdaSequence } from "../LambdaSequence";
import { ISequenceTrackerStatus } from "../exported-functions/SequenceTracker";
import { IErrorClass, IHandlerContext } from "../@types";

/**
 * Reduces a sequence object to a simple "status" based representation
 */
export const sequenceStatus = <T = any>(correlationId: string) => (
  s: LambdaSequence,
  dataOrError?: T | IErrorClass
): ISequenceTrackerStatus => {
  const status = s.isDone
    ? dataOrError instanceof Error
      ? "error"
      : "success"
    : "running";

  const response: Omit<ISequenceTrackerStatus, "data" | "error"> = {
    status,
    correlationId,
    currentFn: s.activeFn.arn,
    originFn: s.steps[0].arn,
    total: s.steps.length,
    current: s.completed.length
  };

  switch (status) {
    case "error":
      return { ...response, error: dataOrError } as ISequenceTrackerStatus;
    case "success":
      return { ...response, data: dataOrError } as ISequenceTrackerStatus;
    case "running":
      return response as ISequenceTrackerStatus;
  }
};
