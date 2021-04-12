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
import { ErrorMeta } from "~/errors";
import { IWrapperContext, IWrapperContextFunctions, IWrapperContextProps, IWrapperOptions } from "~/types";
import {
  setSecretHeaders,
  maskLoggingForSecrets,
  getLocalSecrets,
  setUserHeaders,
  getSecrets,
  setContentType,
  extractRequestState,
  addCookie,
} from "~/wrapper-fn/util";
import { invoke } from "~/invoke";
import { handleError, handlePrepError, handleReturn } from "./steps";

/**
 * **wrapper**
 *
 * A higher order function which wraps a serverless _handler_-function with the aim of providing
 * a better typing, logging, and orchestration experience.
 *
 * @param req a strongly typed request object that is defined by the `<I>` generic
 * @param context the contextual props and functions which AWS provides plus additional
 * features brought in by the wrapper function
 */
export const wrapper = function <I, O extends any, Q extends IDictionary<scalar>, P extends IDictionary<scalar>>(
  fn: (request: I, context: IWrapperContext<Q, P>) => Promise<O>,
  options: IWrapperOptions = {}
) {
  /** this is the core Lambda event which the wrapper takes as an input */
  return async function (
    event: I | IAwsLambdaProxyIntegrationRequest,
    context: IAwsLambdaContext
  ): Promise<O | IAwsApiGatewayResponse> {
    const t0: epochWithMilliseconds = Date.now();
    const log = logger(options.loggerConfig).lambda(event, context);
    const correlationId = log.getCorrelationId();
    log.info(`Starting wrapper function for "${context.functionName}"`, { event, context });
    const state = extractRequestState<I, Q, P>(event, context);
    let response: O = Symbol("Not Yet Defined") as O;
    context.callbackWaitsForEmptyEventLoop = false;
    const errorMeta: ErrorMeta = new ErrorMeta();
    /** the code to use for successful requests */
    let statusCode = 0;
    let handlerContext: IWrapperContext<Q, P>;

    // #region PREP
    try {
      if (state.headers) {
        if (setSecretHeaders(state.headers)) {
          log.info("Secrets found in header");
        } else {
          log.debug("No secrets found in headers");
        }
        maskLoggingForSecrets(getLocalSecrets(), log);
      }

      const contextFns: IWrapperContextFunctions = {
        log,
        getSecrets,
        setSuccessCode: (code: number) => (statusCode = code),
        errorMgmt: errorMeta,
        invoke,
        setHeaders: setUserHeaders,
        setContentType,
        addCookie,
      };

      const contextProps: IWrapperContextProps<Q, P> = {
        correlationId,
        headers: state.headers || {},
        isApiGatewayRequest: state.isApiGateway,
        caller: state.caller,
        identity: state.identity,
        ...(state.isApiGateway
          ? {
              api: state.api,
              token: state.token,
              claims: state.claims,
              verb: state.verb,
              apiGateway: state.apiGateway,
              queryParameters: state.query,
              pathParameters: state.path,
            }
          : {}),
      };

      // the handler's function is now ready for use
      handlerContext = {
        ...(context as Omit<IAwsLambdaContext, "identity">),
        ...contextProps,
        ...contextFns,
      };
    } catch (prepError) {
      return handlePrepError(prepError, context, isLambdaProxyRequest(event), log);
    }
    // #endregion

    // HANDLER FN EXECUTION and ERROR HANDLING
    const t1 = Date.now();
    const prepTime = t1 - t0;
    try {
      response = await fn(state.request, handlerContext);
      const duration = Date.now() - t0;
      return handleReturn<O, Q, P>(response, handlerContext, statusCode, duration, prepTime);
    } catch (handlerFnError) {
      const duration = Date.now() - t0;
      return handleError(handlerFnError, handlerContext, duration, prepTime);
    }
  };
};
