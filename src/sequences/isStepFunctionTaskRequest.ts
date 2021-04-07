import { IStepFunctionTaskRequest, IOrchestrationRequestTypes } from "~/types";

/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IStepFunctionTaskRequest`
 */
export function isStepFunctionTaskRequest<T>(
  msg: T | IOrchestrationRequestTypes<T>,
): msg is IStepFunctionTaskRequest<T> {
  return !!(typeof msg === "object" && (msg as IStepFunctionTaskRequest<T>).type === "step-fn-message-body");
}
