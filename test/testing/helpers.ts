import { IAwsLambdaProxyIntegrationRequestV2, IDictionary, RestMethod } from "common-types";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as process from "process";
import "./test-console"; // TS declaration
import { stdout, stderr } from "test-console";

// tslint:disable-next-line
interface Console {
  _restored: boolean;
  // Console: typeof NodeJS.Console;
  assert(value: any, message?: string, ...optionalParams: any[]): void;
  dir(obj: any, options?: { showHidden?: boolean; depth?: number; colors?: boolean }): void;
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  time(label: string): void;
  timeEnd(label: string): void;
  trace(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}

declare var console: Console;

export function fakeApiGatewayRequest<T>(request: T, method: RestMethod = "POST"): IAwsLambdaProxyIntegrationRequestV2 {
  return ({
    cookies: [],
    version: "2.0",
    headers: {
      Accept: "",
      "Accept-Encoding": "",
      "cache-control": "",
      "CloudFront-Forwarded-Proto": "false",
      "CloudFront-Is-Desktop-Viewer": "true",
      "CloudFront-Is-Mobile-Viewer": "false",
      "CloudFront-Is-SmartTV-Viewer": "false",
      "CloudFront-Is-Tablet-Viewer": "false",
      "User-Agent": "fake-user-agent",
      "Content-Type": "application/json",
      "CloudFront-Viewer-Country": "US",
      Host: "",
      Via: "",
      "X-Amz-Cf-Id": "cf-1234",
      "X-Amzn-Trace-Id": "xxx-aaa-bbb",
      "X-Forwarded-Proto": "",
      "X-Forwarded-For": "",
    },
    isBase64Encoded: false,
    rawPath: "/fake/path",
    rawQueryString: "page=1",
    queryStringParameters: { page: 1 },
    requestContext: ({
      http: {
        method,
        path: "/fake/path",
        protocol: "https",
        sourceIp: "1.2.3.4",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
      },
    } as unknown) as IAwsLambdaProxyIntegrationRequestV2["requestContext"],
    routeKey: "",

    body: JSON.stringify(request),
  } as unknown) as IAwsLambdaProxyIntegrationRequestV2;
}

export function restoreStdoutAndStderr() {
  console._restored = true;
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let envIsSetup = false;

export function setupEnv() {
  if (!envIsSetup) {
    if (!process.env.AWS_STAGE) {
      process.env.AWS_STAGE = "test";
    }
    // const current = process.env;
    const yamlConfig = yaml.load(fs.readFileSync("./env.yml", "utf8")) as IDictionary;
    const combined = {
      ...yamlConfig[process.env.AWS_STAGE],
      ...process.env,
    };

    for (const key of Object.keys(combined)) {
      process.env[key] = combined[key];
    }
    envIsSetup = true;

    return combined;
  }
}

export function ignoreStdout() {
  const rStdout = stdout.ignore();
  const restore = () => {
    rStdout();
    console._restored = true;
  };

  return restore;
}

export function captureStdout(): () => any {
  const rStdout: IAsyncStreamCallback = stdout.inspect();
  const restore = (): string[] => {
    rStdout.restore();
    console._restored = true;
    return rStdout.output;
  };

  return restore;
}

export function captureStderr(): () => any {
  const rStderr: IAsyncStreamCallback = stderr.inspect();
  const restore = (): string[] => {
    rStderr.restore();
    console._restored = true;
    return rStderr.output;
  };

  return restore;
}

export function ignoreStderr() {
  const rStdErr = stderr.ignore();
  const restore = () => {
    rStdErr();
    console._restored = true;
  };

  return restore;
}

export function ignoreBoth() {
  const rStdOut = stdout.ignore();
  const rStdErr = stderr.ignore();
  const restore = () => {
    rStdOut();
    rStdErr();
    console._restored = true;
  };

  return restore;
}

export function valuesOf<T = any>(listOf: IDictionary<T>, property: string) {
  const keys: any[] = Object.keys(listOf);
  return keys.map((key: any) => {
    const item: IDictionary = listOf[key];
    return item[property];
  });
}

export function length(listOf: IDictionary) {
  return listOf ? Object.keys(listOf).length : 0;
}
