import { IOrchestratedRequest, IOrchestrationRequestTypes } from "~/types";

/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IOrchestratedMessageBody`
 */
export function isOrchestratedRequest<T>(message: T | IOrchestrationRequestTypes<T>): message is IOrchestratedRequest<T> {
  return !!(typeof message === "object" && (message as IOrchestratedRequest<T>).type === "orchestrated-message-body");
}
