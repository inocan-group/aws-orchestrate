import {
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaProxyIntegrationRequestHeaders,
  IDictionary,
  IServerlessFunction,
  RestMethod,
  scalar,
} from "common-types";
import { AwsApiStyle, AwsResource } from "./general";
import { IWrapperContext } from "./wrapper-context";

export type IQueryParameters = IDictionary<scalar>;
export type IPathParameters = IDictionary<scalar>;

export type IHandlerFunction<I, O, Q extends object = IQueryParameters, P extends object = IPathParameters> = (
  event: I,
  context: IWrapperContext<Q, P>
) => Promise<O>;

/**
 * The _meta-data_ for a handler function. This can include a description,
 * events, timeouts, etc.
 */
export type IHandlerConfig = Omit<IServerlessFunction & { handler: string }, "handler">;

/**
 * The meta-data for a handler function; this symbol is now deprecated
 * in favor of `IHandlerConfig`.
 *
 * @deprecated
 */
export type IWrapperFunction = IHandlerConfig;

export type DeviceType = "desktop" | "mobile" | "tablet" | "smart-tv" | "unknown";

export interface IWrapperIdentityEssentials {
  /**
   * Information about the Amazon Cognito identity provider when invoked through the AWS Mobile SDK.
   * */
  cognito?: string;
}

/**
 * Aspects that identifier a caller from API-Gateway
 */
export interface IWrapperIdentityDetails extends IWrapperIdentityEssentials {
  /**
   * The IP address of the caller
   */
  ipAddress?: string;
  /**
   * The "user-agent" string that the caller provided
   */
  userAgent?: string;
  /**
   * If Cloudfront -- `CloudFront-Viewer-Country` header value -- can identify the
   * caller's country it will be included here. If not it will just be an empty string.
   */
  country?: string;
  /**
   * Whether given device appears to be a desktop client, a tablet, phone, etc.
   */
  deviceType?: DeviceType;
}

export type IWrapperIdentity = IWrapperIdentityEssentials | IWrapperIdentityDetails;

export interface IApiGatewayRequest<B, Q, P> {
  kind: "api-gateway";
  request: B;
  isApiGateway: true;
  apiGateway: IAwsLambdaProxyIntegrationRequest;
  headers: IAwsLambdaProxyIntegrationRequestHeaders;
  /** the value of the `Authorization` header (if it exists) */
  token: string | undefined;
  identity: IWrapperIdentityDetails;
  path: P;
  query: Q;
  verb: RestMethod;
  claims?: IDictionary;
  caller: AwsResource.ApiGateway;
  api: AwsApiStyle;
}

export interface IBasicRequest<B> {
  kind: "basic";
  request: B;
  isApiGateway: false;
  apiGateway: undefined;
  headers: undefined;
  token: undefined;
  identity: IWrapperIdentityEssentials;
  path: undefined;
  query: undefined;
  verb: undefined;
  claims: undefined;
  caller: AwsResource.Lambda;
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
  identity: IWrapperIdentityEssentials;
  path: undefined;
  query: undefined;
  verb: undefined;
  claims: undefined;
  caller: AwsResource.LambdaWithHeader;
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
