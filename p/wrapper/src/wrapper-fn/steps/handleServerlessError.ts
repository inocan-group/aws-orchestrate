import { ServerlessError } from "~/errors";
import { IWrapperContext } from "~/types";
import { IWrapperMetricsClosure, IWrapperMetricsPreClosure } from "~/types/timing";
import { apiGatewayFailure, XRay } from "../util";

export function handleServerlessError<Q, P>(
  error: ServerlessError,
  context: IWrapperContext<Q, P>,
  metrics: IWrapperMetricsPreClosure | IWrapperMetricsClosure,
  xray: XRay
) {
  const { log, isApiGateway, functionName, correlationId, awsRequestId } = context;
  // enhance the error with meta attributes
  error.functionName = functionName;
  error.correlationId = correlationId;
  error.awsRequestId = awsRequestId;

  metrics = {
    ...metrics,
    kind: "wrapper-metrics",
    errorType: "known",
    errorCode: error.httpStatus,
    handlerForwarding: false,
    handlerFunction: false,
    handlerResolved: false,
    closureDuration: Date.now() - (metrics.startTime + metrics.duration),
  };

  log.info("wrapper-metrics", metrics);
  xray.finishCloseout(metrics, error);

  if (isApiGateway) {
    return apiGatewayFailure(error);
  } else {
    throw error;
  }
}
