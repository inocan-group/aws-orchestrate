import { IPathParameters, IQueryParameters, IServerlessError, IWrapperContext } from "~/types";
import { isServerlessError, UnknownError } from "~/errors";
import { handleServerlessError } from "./handleServerlessError";
import { handleOtherErrors } from "./handleOtherErrors";
import { IDictionary, isTypeSubtype } from "common-types";
import { apiGatewayFailure, XRay } from "../util";
import { IWrapperMetricsClosure, IWrapperMetricsPreClosure } from "~/types/timing";

/**
 * Handles all errors which are thrown when using the _wrapper function_
 * and past the _prep_ phase.
 */
export async function handleError<
  I,
  O,
  Q extends IQueryParameters = IQueryParameters,
  P extends IPathParameters = IPathParameters,
  T extends Error = Error
>(
  error: T,
  request: I,
  context: IWrapperContext<I, O, Q, P>,
  metrics: IWrapperMetricsPreClosure | IWrapperMetricsClosure,
  xray: XRay
) {
  const { log, isApiGateway, functionName, errorMgmt } = context;

  try {
    if (isServerlessError(error)) {
      // A `ServerlessError` is always an _intentful_ error which a user
      // will have thrown for explicit reasons
      return handleServerlessError(error, context, metrics, xray);
    } else {
      // An error was thrown by the handler function but it was not a ServerlessError
      // which means it may have been unexpected, however, it's also possible that the
      // error fits a patterned identified in the Error Manamagement configuration.
      log.debug(`A non-ServerlessError thrown in "${functionName}" handler function`, {
        error,
        context,
      });

      return handleOtherErrors<I, O, Q, P>(error, errorMgmt, request, context, metrics, xray);
    }
  } catch (underlyingError) {
    log.warn("There was an error which occurred during error handling", {
      originalError: error,
      underlyingError,
    });

    const classification =
      typeof (error as IDictionary).classification === "string" &&
      isTypeSubtype(((error as unknown) as IServerlessError).classification)
        ? (error as IDictionary).classification
        : "wrapper-fn/unknown-error";
    const err = isServerlessError(error) ? error : new UnknownError(error, context, classification);
    err.underlyingError = underlyingError;

    metrics = {
      ...metrics,
      kind: "wrapper-metrics",
      closureDuration: Date.now() - (metrics.startTime + metrics.duration),
      underlyingError: true,
    };
    log.info("wrapper-metrics", metrics);
    xray.finishCloseout(metrics, err);

    if (isApiGateway) {
      return apiGatewayFailure(err);
    } else {
      throw err;
    }
  }
}
