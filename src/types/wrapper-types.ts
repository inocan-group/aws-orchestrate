import {
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaProxyIntegrationRequestHeaders,
  IDictionary,
  IHttpRequestHeaders,
  IServerlessFunction,
  RestMethod,
  scalar,
} from "common-types";
import { AwsApiStyle, AwsSource } from "./general";
import { IWrapperContext } from "./wrapper-context";

export type IQueryParameters = IDictionary<scalar>;
export type IPathParameters = IDictionary<scalar>;

export type IHandlerFunction<
  I,
  O,
  Q extends IQueryParameters = IQueryParameters,
  P extends IQueryParameters = IQueryParameters
> = (event: I, context: IWrapperContext<I, O, Q, P>) => Promise<O>;

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

export interface IApiGatewayRequestState<B, Q extends IQueryParameters, P extends IPathParameters> {
  kind: "api-gateway";
  caller: AwsSource;
  request: B;
  isApiGateway: true;
  /**
   * A collection of attributes that help to identify the source/caller.
   * This helps to abstract variations that might exist between REST and HTTP
   * API's.
   */
  identity: IWrapperIdentityDetails;

  /**
   * Distinguishes between the various API styles that API Gateway offers.
   */
  api: AwsApiStyle;
  /**
   * The API Gateway "proxy integration" request data; this can be either version 1.0 or 2.0.
   * If the caller is not API Gateway it will be left undefined.
   */
  apiGateway: IAwsLambdaProxyIntegrationRequest;
  headers: IAwsLambdaProxyIntegrationRequestHeaders;
  /** the value of the `Authorization` header (if it exists) */
  token: string | undefined;
  /**
   * A dictionary of name/value pairs based on the values passed in from the
   * URL/path of the request
   */
  pathParameters: P;
  /**
   * A dictionary of name/value pairs based on the values passed in from the
   * _query parameters_ of the request
   */
  queryParameters: Q;
  /**
   * If the caller is API Gateway, this property will indicate the REST verb used
   * in the call.
   */
  verb: RestMethod;
  /**
   * The _custom claims_ which this function received from API Gateway. This is structured
   * as a dictionary with the claim being the key and the value being any data structure
   * that the app has agreed to.
   *
   * > Note: currently this is only available in REST API's, not HTTP API's.
   */
  claims?: IDictionary;
}

export interface IBasicRequestState<B> {
  kind: "basic";
  caller: AwsSource;
  request: B;
  isApiGateway: false;
  identity: IWrapperIdentityEssentials;

  headers: undefined;
  token: undefined;
  pathParameters: undefined;
  queryParameters: undefined;
  verb: undefined;
  claims: undefined;
  api: undefined;
  apiGateway: undefined;
}

/**
 * A request contains only the top-level properties of
 * `headers` and `body` this will be treated separately
 * from a raw `body` request
 */
export interface IHeaderBodyRequestState<B> {
  kind: "header-body";
  caller: AwsSource.LambdaWithHeader;
  request: B;
  isApiGateway: false;
  identity: IWrapperIdentityEssentials;

  headers: IHttpRequestHeaders;
  /** the value of the `Authorization` header (if it exists) */
  token: string | undefined;
  pathParameters: undefined;
  queryParameters: undefined;
  verb: undefined;
  claims: undefined;
  api: undefined;
  apiGateway: undefined;
}

export type IRequestState<B, Q extends IQueryParameters, P extends IPathParameters> =
  | IApiGatewayRequestState<B, Q, P>
  | IBasicRequestState<B>
  | IHeaderBodyRequestState<B>;
