import {
  IDictionary,
  epochWithMilliseconds,
  scalar,
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaContext,
  IAwsApiGatewayResponse,
  isLambdaProxyRequest,
} from "common-types";

import { logger } from "aws-log";
import { IWrapperContext, IWrapperOptions } from "~/types";
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
  I,
  O extends any,
  Q extends IDictionary<scalar> = IDictionary<scalar>,
  P extends IDictionary<scalar> = IDictionary<scalar>
>(fn: (request: I, context: IWrapperContext<Q, P>) => Promise<O>, options: IWrapperOptions = {}) {
  /** this is the core Lambda event which the wrapper takes as an input */
  return async function (
    event: I | IAwsLambdaProxyIntegrationRequest,
    context: IAwsLambdaContext
  ): Promise<O | IAwsApiGatewayResponse> {
    const t0: epochWithMilliseconds = Date.now();
    const log = logger(options.loggerConfig).lambda(event, context);
    log.info(`Starting wrapper function for "${context.functionName}"`, { event, context });
    const state = extractRequestState<I, Q, P>(event, context);
    let response: O = Symbol("Not Yet Defined") as O;
    context.callbackWaitsForEmptyEventLoop = false;
    const errorMeta: ErrorMeta = new ErrorMeta();
    let wrapperContext: IWrapperContext<Q, P>;

    // PREP
    try {
      wrapperContext = prepForHandler<I, Q, P>(state, context, errorMeta, log);
    } catch (prepError) {
      return handlePrepError(prepError, context, isLambdaProxyRequest(event), log);
    }

    // FN EXECUTION and ERROR HANDLING
    const t1 = Date.now();
    const prepTime = t1 - t0;
    try {
      response = await fn(state.request, wrapperContext);
      const duration = Date.now() - t0;
      return handleReturn<O, Q, P>(response, wrapperContext, duration, prepTime);
    } catch (handlerFnError) {
      const duration = Date.now() - t0;
      return handleError<I, O, P, Q>(handlerFnError, state.request, wrapperContext, duration, prepTime);
    }
  };
};
