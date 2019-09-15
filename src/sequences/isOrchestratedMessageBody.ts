import { IOrchestratedMessageBody } from "../@types";

/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IOrchestratedMessageBody`
 */
export function isOrchestratedMessageBody<T>(
  msg: T | IOrchestratedMessageBody<T>
): boolean {
  return typeof msg === "object" &&
    (msg as IOrchestratedMessageBody<T>).type === "orchestrated-message-body"
    ? true
    : false;
}
