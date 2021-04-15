import {
  IAwsLambdaProxyIntegrationRequest,
  isLambdaProxyRequest,
  isProxyRequestContextV2,
  IAwsLambdaContext,
} from "common-types";
import {
  AwsApiStyle,
  AwsSource,
  DeviceType,
  IRequestState,
  isHeaderBodyRequest,
  IWrapperIdentityDetails,
  IWrapperIdentityEssentials,
} from "~/types";

/**
 * Ensures that the relevant "state" from the caller is received in a consistent
 * fashion. The state includes:
 *
 * - body <B>,
 * - query parameters <Q>,
 * - path parameters <P>,
 * - and API verb (aka, GET, POST)
 *
 * This addresses the differences you get from a API Gateway (both Rest and Http APIs)
 * caller versus other callers and ensures that all "state" passed in by the caller
 * can be handed in a consistent and typed manner.
 */
export function extractRequestState<I, Q extends object, P extends object>(
  event: I | IAwsLambdaProxyIntegrationRequest,
  context: IAwsLambdaContext
): IRequestState<I, Q, P> {
  if (isLambdaProxyRequest(event)) {
    let deviceType: DeviceType;
    if (event.headers["CloudFront-Is-Desktop-Viewer"]) {
      deviceType = "desktop";
    } else if (event.headers["CloudFront-Is-Tablet-Viewer"]) {
      deviceType = "mobile";
    } else if (event.headers["CloudFront-Is-Tablet-Viewer"]) {
      deviceType = "tablet";
    } else if (event.headers["CloudFront-Is-SmartTV-Viewer"]) {
      deviceType = "smart-tv";
    } else {
      deviceType = "unknown";
    }

    const identity: IWrapperIdentityDetails = {
      ipAddress: isProxyRequestContextV2(event)
        ? event.requestContext.http.sourceIp
        : event.requestContext.identity.sourceIp,
      userAgent: isProxyRequestContextV2(event)
        ? event.requestContext.http.userAgent
        : event.requestContext.identity.userAgent,
      country: event.headers["CloudFront-Viewer-Country"] || "",
      deviceType,
      cognito: context.identity,
    };

    return {
      kind: "api-gateway",
      request: JSON.parse(event.body) as I,
      identity,
      isApiGateway: true,
      apiGateway: event,
      headers: event.headers,
      token: event.headers.Authenticate as string,
      path: event.pathParameters as P,
      query: event.queryStringParameters as Q,
      verb: isProxyRequestContextV2(event) ? event.requestContext.http.method : event.requestContext.httpMethod,
      claims: isProxyRequestContextV2(event) ? undefined : event.requestContext.authorizer.claims,
      api: isProxyRequestContextV2(event) ? AwsApiStyle.HttpApi : AwsApiStyle.RestApi,
      caller: AwsSource.ApiGateway,
    };
  }

  const identity: IWrapperIdentityEssentials = {
    cognito: context.identity,
  };

  return isHeaderBodyRequest<I>(event)
    ? {
        kind: "header-body",
        request: event.body,
        isApiGateway: false,
        headers: event.headers,
        token: event.headers.Authenticate as string,
        identity,
        path: undefined,
        query: undefined,
        verb: undefined,
        claims: undefined,
        caller: AwsSource.LambdaWithHeader,
      }
    : {
        kind: "basic",
        request: event as I,
        isApiGateway: false,
        headers: undefined,
        token: undefined,
        identity,
        path: undefined,
        query: undefined,
        verb: undefined,
        claims: undefined,
        caller: AwsSource.Lambda,
      };
}
