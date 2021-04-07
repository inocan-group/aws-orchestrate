import { isLambdaProxyRequest } from "common-types";
import { isOrchestratedRequest } from "./isOrchestratedMessageBody";
import { IOrchestrationRequestTypes, IBareRequest } from "~/types";

export function isBareRequest<T>(event: IOrchestrationRequestTypes<T>): event is IBareRequest<T> {
  return !!(!isLambdaProxyRequest(event) && !isOrchestratedRequest(event));
}
