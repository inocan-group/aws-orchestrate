import { IOrchestrationRequestTypes, IBareRequest } from "../@types";
import { isLambdaProxyRequest } from "common-types";
import { isOrchestratedRequest } from "./isOrchestratedMessageBody";

export function isBareRequest<T>(
  event: IOrchestrationRequestTypes<T>
): event is IBareRequest<T> {
  return !isLambdaProxyRequest(event) && !isOrchestratedRequest(event)
    ? true
    : false;
}
