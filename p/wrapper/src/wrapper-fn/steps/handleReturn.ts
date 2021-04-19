import { HttpStatusCodes, IAwsApiGatewayResponse } from "common-types";
import { ServerlessError } from "~/errors";
import { IPathParameters, IQueryParameters, IWrapperContext } from "~/types";
import { IWrapperMetricsClosure, IWrapperMetricsPreClosure } from "~/types/timing";
import { apiGatewaySuccess, getStatusCode, XRay } from "../util";

/**
 * When the wrapper function gets a returned value from the _handler function_
 * this function is responsible for returning the appropriate response to
 * the caller.
 */
export function handleReturn<
  O extends any,
  Q extends IQueryParameters = IQueryParameters,
  P extends IPathParameters = IPathParameters
>(
  response: O,
  context: IWrapperContext<any, O, Q, P>,
  metrics: IWrapperMetricsPreClosure | IWrapperMetricsClosure,
  xray: XRay
): O | IAwsApiGatewayResponse {
  const { log, isApiGateway } = context;
  const defaultCode: number =
    response === undefined || response === "" ? HttpStatusCodes.NoContent : HttpStatusCodes.Success;
  const statusCode = getStatusCode() || defaultCode;

  // it's not typical, but a user could state a success code that is
  // is in the error range. If this is the case we will ensure that
  // metrics are updated accordingly
  metrics =
    statusCode >= 300
      ? {
          ...metrics,
          kind: "wrapper-metrics",
          closureDuration: Date.now() - (metrics.startTime + metrics.duration),
          errorCode: statusCode,
          errorType: "known",
          underlyingError: false,
          handlerForwarding: false,
          handlerFunction: false,
        }
      : {
          ...metrics,
          kind: "wrapper-metrics",
          closureDuration: Date.now() - (metrics.startTime + metrics.duration),
          errorCode: statusCode,
          errorType: "known",
          underlyingError: false,
          handlerForwarding: false,
          handlerFunction: false,
        };

  // log metrics
  log.info("wrapper-metrics", metrics);
  // close XRay Segment
  if (statusCode >= 300) {
    const error = new ServerlessError(
      statusCode,
      JSON.stringify(response),
      "wrapper-fn/returned-error"
    );
    xray.finishCloseout(metrics, error);
  } else {
    xray.finishCloseout(metrics);
  }

  // return error or success via api gateway
  if (isApiGateway) {
    return apiGatewaySuccess(response);
  }
  // for other callers we will still just
  // return the response; if the handler function
  // wants us to throw an error it should throw
  // a ServerlessError not return a value

  return response;
}
