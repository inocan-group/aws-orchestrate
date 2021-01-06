import { IOrchestratedRequest, IOrchestrationRequestTypes } from "../@types";

/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IOrchestratedMessageBody`
 */
export function isOrchestratedRequest<T>(msg: T | IOrchestrationRequestTypes<T>): msg is IOrchestratedRequest<T> {
  return typeof msg === "object" && (msg as IOrchestratedRequest<T>).type === "orchestrated-message-body"
    ? true
    : false;
}
