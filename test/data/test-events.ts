import { IAwsLambdaProxyIntegrationRequestV2 } from "common-types";
import { IWrapperContext } from "~/types";

export interface IRequest {
  foo: string;
  bar: number;
}

export interface IResponse {
  testing: boolean;
  request: IRequest;
  context: IWrapperContext<any, any>;
}

export const simpleEvent: IRequest = {
  foo: "foo is foo",
  bar: 456,
};

export const SimpleApiGatewayEvent_V2: (body: any) => IAwsLambdaProxyIntegrationRequestV2 = (
  body = simpleEvent
) => ({
  version: "2.0",
  body: JSON.stringify(body),
  headers: {
    "Content-Type": "application/json",
    Accept: "",
    Authorization: "Bearer test-token",
    "Accept-Encoding": "",
    "CloudFront-Is-Desktop-Viewer": "true",
    "CloudFront-Is-Mobile-Viewer": "false",
    "CloudFront-Is-SmartTV-Viewer": "false",
    "CloudFront-Is-Tablet-Viewer": "false",
    "CloudFront-Viewer-Country": "US",
  } as IAwsLambdaProxyIntegrationRequestV2["headers"],
  cookies: [],
  isBase64Encoded: false,
  rawPath: "/test/path",
  rawQueryString: "",
  requestContext: {
    accountId: "12345",
    apiId: "23456",
    authorizer: { jwt: "dfasdfadfasdfadsferwer" },
    domainName: "test.com",
    domainPrefix: "",
    http: {
      method: "POST",
      path: "/test/path",
      protocol: "HTTP/1.1",
      sourceIp: "1.2.3.4",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    },
    requestId: "r-1234",
    routeKey: "$default",
    stage: "dev",
    time: "12/Mar/2020:19:03:58 +0000",
    timeEpoch: 3,
  },
  routeKey: "$default",
  stageVariables: {},
  pathParameters: { foo: "bar" },
  queryStringParameters: { page: 1 },
});
