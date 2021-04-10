import {
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaProxyIntegrationRequestHeaders,
  IDictionary,
  RestMethod,
  scalar,
} from "common-types";

export interface IApiGatewayRequest<B, Q, P> {
  kind: "api-gateway";
  request: B;
  isApiGateway: true;
  apiGateway: IAwsLambdaProxyIntegrationRequest;
  headers: IAwsLambdaProxyIntegrationRequestHeaders;
  /** the value of the `Authorization` header (if it exists) */
  token: string | undefined;
  path: P;
  query: Q;
  verb: RestMethod;
  claims?: IDictionary;
}

export interface IBasicRequest<B> {
  kind: "basic";
  request: B;
  isApiGateway: false;
  apiGateway: undefined;
  headers: undefined;
  token: undefined;
  path: undefined;
  query: undefined;
  verb: undefined;
  claims: undefined;
}

/**
 * A request contains only the top-level properties of
 * `headers` and `body` this will be treated separately
 * from a raw `body` request
 */
export interface IHeaderBodyRequest<B> {
  kind: "header-body";
  request: B;
  isApiGateway: false;
  apiGateway: undefined;
  headers: IDictionary<scalar>;
  /** the value of the `Authorization` header (if it exists) */
  token: string | undefined;
  path: undefined;
  query: undefined;
  verb: undefined;
  claims: undefined;
}

export interface IHeaderBodyEvent<B> {
  headers: IDictionary<scalar>;
  body: B;
}

export function isHeaderBodyEvent<B>(event: unknown): event is IHeaderBodyEvent<B> {
  return (
    typeof event === "object" &&
    event != null &&
    Object.keys(event).length === 2 &&
    (event as IDictionary).body &&
    (event as IDictionary).headers
  );
}

export type IRequestState<B, Q, P> = IApiGatewayRequest<B, Q, P> | IBasicRequest<B> | IHeaderBodyRequest<B>;

export enum WorkflowStatus {
  /** handler setting up context and getting ready to hand over to handler fn */
  "initializing" = "initializing (1 of 5)",
  /** the wrapper has handed execution control over to the handler fn */
  "handlerRunning" = "handlerRunning (2 of 5)",
  /** the handler has returned execution control to the wrapper function */
  "handlerComplete" = "handlerComplete (3 of 5)",
  /** the wrapper fn is managing through the error handling features */
  "errorHandling" = "errorHandling (4 of 5)",
  /** the wrapper fn is completing the final steps before exiting */
  "completing" = "completing (5 of 5)",
}
