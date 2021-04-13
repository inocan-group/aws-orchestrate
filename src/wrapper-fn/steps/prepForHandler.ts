import { ILoggerApi } from "aws-log";
import { IAwsLambdaContext } from "common-types";
import {
  IPathParameters,
  IQueryParameters,
  IRequestState,
  IWrapperContext,
  IWrapperContextFunctions,
  IWrapperContextProps,
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
import { invoke } from "~/invoke";

export function prepForHandler<I, O, Q extends object = IQueryParameters, P extends object = IPathParameters>(
  state: IRequestState<I, Q, P>,
  context: IAwsLambdaContext,
  errorMeta: ErrorMeta<I, O>,
  log: ILoggerApi
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
    invoke,
    setHeaders: setUserHeaders,
    setContentType,
    addCookie,
  };

  const contextProps: IWrapperContextProps<Q, P> = {
    correlationId,
    headers: state.headers || {},
    isApiGatewayRequest: state.isApiGateway,
    identity: state.identity,
    ...(state.isApiGateway
      ? {
          api: state.api,
          caller: state.caller,
          token: state.token,
          claims: state.claims,
          verb: state.verb,
          apiGateway: state.apiGateway,
          queryParameters: state.query,
          pathParameters: state.path,
        }
      : {
          caller: state.caller,
          token: state.token,
        }),
  };

  // the handler's function is now ready for use
  return {
    ...(context as Omit<IAwsLambdaContext, "identity">),
    ...contextProps,
    ...contextFns,
  };
}
