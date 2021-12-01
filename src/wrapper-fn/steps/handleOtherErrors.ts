import { IAwsApiGatewayResponse } from "common-types";
import { KnownError, UnknownError } from "~/errors";
import {
  IError,
  IPathParameters,
  IWrapperContext,
  IWrapperMetricsClosure,
  IWrapperMetricsPreClosure,
} from "~/types";
import { findError, ErrorMeta, apiGatewayFailure, apiGatewaySuccess, XRay } from "../util";

/**
 * Handles _non_-`ServerlessError` thrown during execution of the handler
 * function.
 *
 * If the _caller_ is API Gateway it will return an error response in a format recognized, otherwise
 * it will throw either a `KnownError` or `UnknownError` based on if the error is found via the
 * error management API.
 *
 * @param error The error from the handler function
 * @param errorMeta the configuration for error management
 */
export async function handleOtherErrors<
  I,
  O,
  Q extends IPathParameters = IPathParameters,
  P extends IPathParameters = IPathParameters,
  T extends IError = IError
>(
  originatingError: T,
  errorMeta: ErrorMeta<I, O>,
  request: I,
  context: IWrapperContext<I, O, Q, P>,
  metrics: IWrapperMetricsPreClosure | IWrapperMetricsClosure,
  xray: XRay
): Promise<IAwsApiGatewayResponse | O> {
  const { log, isApiGateway } = context;
  const found = findError<I, O>(originatingError, errorMeta);
  const { errorMgmt } = context;

  let error: KnownError<I, O> | UnknownError;

  if (found) {
    error = new KnownError<I, O>(originatingError, found, context);

    if (originatingError.code) {
      error.code = originatingError.code;
    }

    // User has registered callback fn for known error
    if (found.handling && found.handling.callback) {
      log.info("Calling handler function's error handler callback", { error });

      const result: O | false = await found.handling.callback(
        originatingError,
        found,
        request,
        context
      );
      if (result !== false) {
        // Error handled and converted to a success!
        log.info("handler had a successful result; error will abandoned", {
          kind: "error-handler-handled",
          response: result,
        });
        xray.handlerFunctionCalled("known");
        metrics = {
          ...metrics,
          kind: "wrapper-metrics",
          errorType: "known",
          errorCode: error.httpStatus,
          handlerForwarding: false,
          handlerFunction: true,
          handlerResolved: true,
          closureDuration: Date.now() - (metrics.startTime + metrics.duration),
        };
        xray.finishCloseout(metrics);
        return isApiGateway ? apiGatewaySuccess(result) : result;
      } else {
        log.info("handler function was executed but error was not corrected", {
          kind: "error-handler-failed",
        });
      }
    }

    // User has requested error to be forwarded
    if (found.handling && found.handling.forwardTo) {
      log.info(`forwarding error to ${found.handling.forwardTo}`, {
        error,
        arn: found.handling.forwardTo,
      });
      await context.invoke(found.handling.forwardTo, error);
    }

    metrics = {
      ...metrics,
      kind: "wrapper-metrics",
      errorType: "known",
      errorCode: error.httpStatus,
      handlerForwarding: found.handling.forwardTo ? true : false,
      handlerFunction: found.handling.callback ? true : false,
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

  // UNKNOWN ERRORS
  error = new UnknownError(
    originatingError,
    context,
    originatingError.classification || "wrapper-fn/unknown-error"
  );
  metrics = {
    ...metrics,
    kind: "wrapper-metrics",
    errorType: "unknown",
    errorCode: error.httpStatus,
    handlerForwarding: false,
    handlerFunction: false,
    handlerResolved: false,
    closureDuration: Date.now() - (metrics.startTime + metrics.duration),
  };
  // use default handler if available
  if (errorMgmt.defaultHandler) {
    // forwarding to a Lambda
    if (typeof errorMgmt.defaultHandler === "string") {
      try {
        metrics.handlerFunction = true;
        xray.errorForwarded(errorMgmt.defaultHandler);
        await context.invoke(errorMgmt.defaultHandler, request);
      } catch (errhandlerError) {
        metrics.underlyingError = true;
        error.underlyingError = errhandlerError as Error;
        log.warn("The default error handler was invoked but it threw an error during invocation!", {
          error: errhandlerError,
          kind: "error-handler-error",
        });
      }
    } else {
      // default handler was a callback; which provides opportunity to actually convert
      // an error to a successful outcome.
      metrics.handlerFunction = true;
      xray.handlerFunctionCalled("default");
      const result = await errorMgmt.defaultHandler(error);
      if (result !== false) {
        metrics = {
          ...metrics,
          handlerResolved: true,
          closureDuration: Date.now() - (metrics.startTime + metrics.duration),
        };
        log.info("wrapper-metrics", metrics);
        xray.finishCloseout(metrics, error);
        return isApiGateway ? apiGatewaySuccess(result) : result;
      }
    }
  }

  metrics = {
    ...metrics,
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
