import { ILoggerApi } from "aws-log";
import { IAwsLambdaContext } from "common-types";
import {
  AwsSource,
  IPathParameters,
  IQueryParameters,
  IRequestState,
  IWrapperContext,
  IWrapperContextFunctions,
  IWrapperContextProps,
  IWrapperOptions,
} from "~/types";
import {
  getLocalSecrets,
  maskLoggingForSecrets,
  setSecretHeaders,
  getSecrets,
  addCookie,
  setContentType,
  setUserHeaders,
  setStatusCode,
  ErrorMeta,
} from "../util";
import { configureLambda, configureStepFn } from "~/wrapper-fn/util/invoke";

export function prepForHandler<
  I,
  O,
  Q extends object = IQueryParameters,
  P extends object = IPathParameters
>(
  state: IRequestState<I, Q, P>,
  context: IAwsLambdaContext,
  errorMeta: ErrorMeta<I, O>,
  log: ILoggerApi,
  options: IWrapperOptions
): IWrapperContext<I, O, Q, P> {
  const correlationId = log.getCorrelationId();

  if (state.headers) {
    if (setSecretHeaders(state.headers)) {
      log.info("Secrets found in header");
    } else {
      log.debug("No secrets found in headers");
    }
    maskLoggingForSecrets(getLocalSecrets(), log);
  }

  const contextFns: IWrapperContextFunctions<I, O> = {
    log,
    getSecrets,
    setSuccessCode: setStatusCode,
    errorMgmt: errorMeta,
    setHeaders: setUserHeaders,
    setContentType,
    addCookie,
    // calling into AWS features requires passing in proper symbols
    // to `IWrapperOptions` at runtime
    invoke: configureLambda(options.Lambda),
    invokeStepFn: configureStepFn(options.StepFunctions),
  };

  const contextProps: IWrapperContextProps<Q, P> = {
    correlationId,
    isApiGateway: state.isApiGateway,
    identity: state.identity,
    api: state.api,
    headers: state.headers,
    caller: AwsSource.ApiGateway,
    token: state.token,
    claims: state.claims,
    verb: state.verb,
    apiGateway: state.apiGateway,
    queryParameters: state.query,
    pathParameters: state.path,
  };

  // the handler's function is now ready for use
  return {
    ...(context as Omit<IAwsLambdaContext, "identity">),
    ...contextProps,
    ...contextFns,
  };
}
