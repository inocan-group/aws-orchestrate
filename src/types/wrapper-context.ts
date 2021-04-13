import { ILoggerApi } from "aws-log";
import {
  IAwsLambdaContext,
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaProxyIntegrationRequestHeaders,
  IDictionary,
  IHttpRequestHeaders,
  RestMethod,
} from "common-types";
import { InvocationResponse, UnconstrainedHttpHeaders } from "~/invoke";
import type { ErrorMeta } from "~/wrapper-fn/util/ErrorMeta";
import { setContentType, addCookie, setUserHeaders } from "~/wrapper-fn/util/headers";
import { getSecrets } from "~/wrapper-fn/util/secrets";
import { AwsApiStyle, AwsResource } from "./general";
import { IWrapperIdentity, IWrapperIdentityDetails } from "./wrapper-types";

/**
 * The _functions_ provided by the wrapper function that are provided
 * to all users of the wrapper regardless of who the caller is.
 */
export interface IWrapperContextFunctions<I, O> {
  /**
   * **log**
   *
   * The logging API. It has a largish surface area but for most users the
   * key interface is fairly typical for a logging API (aka, severity based
   * methods):
   *
   * - `debug` - log at the debugging level
   * - `info` - log at the info level
   * - `warn` - log at the warning level
   * - `error` - log at the error level
   *
   * What severity level is actually sent to AWS's cloudwatch logs is based on
   * how you configure it and what _stage_ you're executing in. Refer to the
   * docs for more on this.
   */
  log: ILoggerApi;

  /**
   * **getSecrets**
   *
   * gets secrets; leveraging passed in header secrets or going to AWS's
   * **SSM** if needed.
   *
   * ```typescript
   * const secrets = await context.getSecrets('firebase', 'netlify')
   * ```
   */
  getSecrets: typeof getSecrets;

  /**
   * Allows the status code of a _successful_ handler execution to be stated; if
   * left off then it will return `200` (or `204` if no content is returned).
   *
   * **Note:** this is available to functions regardless of _caller_ but really only
   * makes sense when returning from an API Gateway caller (both HTTP and REST API's).
   * That said, it is completely non-destructive for non API Gateway callers.
   */
  setSuccessCode: (code: number) => void;

  /**
   * **errorMgmt**
   *
   * Allows you to manage how to handle errors which are encountered; both _expected_
   * and _unexpected_ are captured and each can be handled in whatever way you prefer.
   *
   * Read the [docs]() for more info.
   */
  errorMgmt: ErrorMeta<I, O>;
  /**
   * **setContentType**
   *
   * If your handler function is responding to an API-Gateway request, we default to assuming
   * that you'll be returning `application/json` as a content-type for _non-GET_ based requests
   * but you can specify a different content-type as appropriate.
   *
   * **Note:** if you set this for a non API-Gateway caller it will have no effect.
   */
  setContentType: typeof setContentType;
  /**
   * **addHeaders**
   *
   * Most of the required headers sent back to **API Gateway** will be provided automatically
   * (e.g., CORS, correlationId, content-type, etc.) but if your function needs to send
   * additional headers then you can add them here.
   */
  setHeaders: typeof setUserHeaders;

  /**
   * **addCookie**
   *
   * Provides a convenient way to add cookies to the response object's headers.
   * This feature will only work in a meaningful way when replying to a caller from
   * API Gateway.
   */
  addCookie: typeof addCookie;

  /**
   * Invokes another Lambda function.
   *
   * @param fnArn the Function's ARN
   * @param request the request parameters to pass into next fn
   * @param additionalHeaders optionally pass additional header name/values
   *
   * **Note:** this function automatically forwards `X-Correlation-Id`
   * and any secrets that the execution function has gotten
   */
  invoke: <T = IDictionary, H = UnconstrainedHttpHeaders>(
    functionArn: string,
    request: T,
    additionalHeaders?: H
  ) => Promise<InvocationResponse>;
}

/**
 * Properties found in callers with a `headers` property
 */
export interface IHasHeaderContext {
  /**
   * The HTTP headers variables passed by caller
   */
  headers: IDictionary | {};
  /**
   * If the caller sent in a value in the `Authenticate` header then it will be
   * represented here.
   */
  token: string | undefined;
}

/**
 * Properties available across all caller types
 */
export interface IWrapperContextCommonProps {
  identity: IWrapperIdentity;
  /**
   * The unique `id` assigned to this function and any functions
   * which are invoked downstream of this function
   */
  correlationId: string;

  /**
   * A boolean flag which indicates whether the current execution was started by an API Gateway
   * event.
   */
  isApiGatewayRequest: boolean;
}

/**
 * Context when the caller is a Lambda which has the `headers`/`body`
 * props injected by `aws-orchestrate` when one function calls another
 */
export type IWrapperHeaderAndBodyContext = IWrapperContextCommonProps &
  IHasHeaderContext & {
    caller: AwsResource.LambdaWithHeader;
    headers: IHttpRequestHeaders | {};
  };

/**
 * Context provided when the caller is a Lambda caller
 */
export type IWrapperLambdaContext = IWrapperContextCommonProps & {
  caller: AwsResource.Lambda;
  headers: {};
};

/**
 * Context provided when the caller is API Gateway
 */
export type IWrapperApiGatewayContext<Q, P> = IWrapperContextCommonProps &
  IHasHeaderContext & {
    caller: AwsResource.ApiGateway;
    /**
     * Distinguishes between the various API styles that API Gateway offers.
     */
    api: AwsApiStyle;
    headers: IAwsLambdaProxyIntegrationRequestHeaders | {};
    /**
     * A dictionary of name/value pairs based on the values passed in from the
     * _query parameters_ of the request
     */
    queryParameters: Q | {};
    /**
     * A dictionary of name/value pairs based on the values passed in from the
     * URL/path of the request
     */
    pathParameters: P | {};

    /**
     * If the caller is API Gateway, this property will indicate the REST verb used
     * in the call.
     */
    verb: RestMethod | undefined;

    /**
     * The _custom claims_ which this function received from API Gateway. This is structured
     * as a dictionary with the claim being the key and the value being any data structure
     * that the app has agreed to.
     *
     * > Note: currently this is only available in REST API's, not HTTP API's.
     */
    claims?: IDictionary;

    /**
     * The API Gateway "proxy integration" request data; this can be either version 1.0 or 2.0.
     * If the caller is not API Gateway it will be left undefined.
     */
    apiGateway: IAwsLambdaProxyIntegrationRequest;

    /**
     * A collection of attributes that help to identify the source/caller.
     * This helps to abstract variations that might exist between REST and HTTP
     * API's.
     */
    identity: IWrapperIdentityDetails;
  };

/** properties that wrapper function adds to the AWS context */
export type IWrapperContextProps<Q, P> = IWrapperContextCommonProps &
  (IWrapperHeaderAndBodyContext | IWrapperApiGatewayContext<Q, P> | IWrapperLambdaContext);

/**
 * The AWS `context` plus additional properties/functions that the `wrapper`
 * function provides.
 */
export type IWrapperContext<I, O, Q extends object = IDictionary, P extends object = IDictionary> = Omit<
  IAwsLambdaContext,
  "identity"
> &
  IWrapperContextProps<Q, P> &
  IWrapperContextFunctions<I, O>;
