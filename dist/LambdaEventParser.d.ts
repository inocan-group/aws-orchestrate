import { IDictionary, IAWSLambdaProxyIntegrationRequest } from "common-types";
export declare class LambdaEventParser {
    static parse<T extends IDictionary = IDictionary>(event: T | IAWSLambdaProxyIntegrationRequest): {
        request: T;
        apiGateway: Pick<IAWSLambdaProxyIntegrationRequest, "resource" | "path" | "httpMethod" | "headers" | "queryStringParameters" | "pathParameters" | "requestContext" | "isBase64Encoded">;
    };
}
