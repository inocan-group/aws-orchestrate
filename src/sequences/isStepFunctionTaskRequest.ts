import { IStepFunctionTaskRequest, IOrchestrationRequestTypes } from "~/types";

/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IStepFunctionTaskRequest`
 */
export function isStepFunctionTaskRequest<T>(
  message: T | IOrchestrationRequestTypes<T>,
): message is IStepFunctionTaskRequest<T> {
  return !!(typeof message === "object" && (message as IStepFunctionTaskRequest<T>).type === "step-fn-message-body");
}
