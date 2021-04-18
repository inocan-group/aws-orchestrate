import {
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaContext,
  IAwsApiGatewayResponse,
  isLambdaProxyRequest,
} from "common-types";
import { logger } from "aws-log";
import {
  IPathParameters,
  IQueryParameters,
  IWrapperContext,
  IWrapperOptions,
  IWrapperMetrics,
} from "~/types";
import { ErrorMeta, extractRequestState } from "./util";
import { handleError, handlePrepError, handleReturn, prepForHandler } from "./steps";

/**
 * **wrapper**
 *
 * A higher order function which wraps a serverless _handler_-function with the aim of providing
 * a better typing, logging, and orchestration experience.
 *
 * @param req a strongly typed request object that is defined by the `<I>` generic and represents the _body_ of the message
 * @param context the contextual props and functions which AWS provides plus additional
 * features brought in by the wrapper function
 */
export const wrapper = function <
  /** the body's input */
  I,
  /** the handler's output*/
  O extends any,
  Q extends object = IQueryParameters,
  P extends object = IPathParameters
>(
  fn: (request: I, context: IWrapperContext<I, O, Q, P>) => Promise<O>,
  options: IWrapperOptions = {}
) {
  /** this is the core Lambda event which the wrapper takes as an input */
  return async function (
    event: I | IAwsLambdaProxyIntegrationRequest,
    context: IAwsLambdaContext
  ): Promise<O | IAwsApiGatewayResponse> {
    let metrics: IWrapperMetrics = { kind: "start", startTime: Date.now() };
    const log = logger(options.loggerConfig).lambda(event, context);
    log.info(`Starting wrapper function for "${context.functionName}"`, { event, context });
    const state = extractRequestState<I, Q, P>(event, context);
    let response: O = Symbol("Not Yet Defined") as O;
    context.callbackWaitsForEmptyEventLoop = false;
    const errorMeta = new ErrorMeta<I, O>();
    let wrapperContext: IWrapperContext<I, O, Q, P>;

    // PREP
    try {
      wrapperContext = prepForHandler<I, O, Q, P>(state, context, errorMeta, log, options);
    } catch (prepError) {
      return handlePrepError(prepError, context, isLambdaProxyRequest(event), log);
    }

    // FN EXECUTION and ERROR HANDLING
    metrics = { ...metrics, kind: "prepped", ...{ prepTime: Date.now() - metrics.startTime } };
    try {
      response = await fn(state.request, wrapperContext);
      metrics = {
        ...metrics,
        kind: "pre-closure",
        success: true,
        duration: Date.now() - metrics.startTime,
      };
      return handleReturn<O, Q, P>(response, wrapperContext, metrics);
    } catch (handlerFnError) {
      metrics = {
        ...metrics,
        kind: "pre-closure",
        success: false,
        duration: Date.now() - metrics.startTime,
      };
      return handleError<I, O, P, Q>(handlerFnError, state.request, wrapperContext, metrics);
    }
  };
};
