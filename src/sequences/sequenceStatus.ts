import { LambdaSequence } from "~/LambdaSequence";
import { IErrorClass } from "~/types";

/**
 * A higher order function which first takes a `correlationId` and returns a function which provides
 * a simple status of the sequence.
 */
export const sequenceStatus = <T = any>(correlationId: string) =>
  /**
   * Reduces a sequence object to a simple "status" based representation
   */
  (s: LambdaSequence, dataOrError?: T | IErrorClass): ISequenceTrackerStatus => {
    const status = s.isDone ? (dataOrError instanceof Error ? "error" : "success") : "running";

    const response: Omit<ISequenceTrackerStatus, "data" | "error"> = {
      status,
      correlationId,
      currentFn: s.activeFn ? s.activeFn.arn : "",
      originFn: s.activeFn ? s.steps[0].arn : "",
      total: s.steps.length,
      current: s.completed.length,
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
