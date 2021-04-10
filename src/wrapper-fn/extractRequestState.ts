import {
  IAwsLambdaProxyIntegrationRequest,
  IDictionary,
  scalar,
  isLambdaProxyRequest,
  isProxyRequestContextV2,
} from "common-types";
import { IRequestState, isHeaderBodyEvent } from "~/types/wrapper-types";

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
export function extractRequestState<B, Q extends IDictionary<scalar>, P extends IDictionary<scalar>>(
  event: B | IAwsLambdaProxyIntegrationRequest
): IRequestState<B, Q, P> {
  if (isLambdaProxyRequest(event)) {
    return {
      kind: "api-gateway",
      request: JSON.parse(event.body) as B,
      isApiGateway: true,
      apiGateway: event,
      headers: event.headers,
      token: event.headers.Authenticate as string,
      path: event.pathParameters as P,
      query: event.queryStringParameters as Q,
      verb: isProxyRequestContextV2(event) ? event.requestContext.http.method : event.requestContext.httpMethod,
      claims: isProxyRequestContextV2(event) ? undefined : event.requestContext.authorizer.claims,
    };
  }

  return isHeaderBodyEvent(event)
    ? {
        kind: "header-body",
        request: event.body as B,
        isApiGateway: false,
        apiGateway: undefined,
        headers: event.headers,
        token: event.headers.Authenticate as string,
        path: undefined,
        query: undefined,
        verb: undefined,
        claims: undefined,
      }
    : {
        kind: "basic",
        request: event,
        isApiGateway: false,
        apiGateway: undefined,
        headers: undefined,
        token: undefined,
        path: undefined,
        query: undefined,
        verb: undefined,
        claims: undefined,
      };
}
