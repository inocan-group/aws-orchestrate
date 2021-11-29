/* eslint-disable unicorn/consistent-function-scoping */
import {
  IAwsLambdaContext,
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaProxyIntegrationRequestV2,
} from "common-types";
import * as helpers from "../helpers/helpers";

import { isServerlessError, isUnknownError, ServerlessError, UnknownError } from "~/errors";
import { wrapper } from "~/wrapper-fn";
import { IErrorHandlerFunction, IHandlerFunction } from "~/types";

const CORRELATION_ID = "c-123";
const AWS_REQUEST_ID = "1234";
const FUNCTION_NAME = "myHandlerFunction";
const ERROR_CODE = 403;
const handlerFnWithServerlessError: IHandlerFunction<void, void> = async (_req, _ctx) => {
  throw new ServerlessError(ERROR_CODE, "a test of an explicit error throw", "testing");
};

const genHandlerWithDefaultErrorHandling: (
  c?: number,
  handler?: IErrorHandlerFunction<string>
) => IHandlerFunction<void, string> = (errCode, handler) => (_req, ctx) => {
  ctx.errorMgmt.setDefaultErrorCode(errCode || 500);
  if (handler) {
    ctx.errorMgmt.setDefaultHandler(handler);
  }
  throw new Error("a test of an explicit error throw");
};

describe("Handling errors => ", () => {
  it("throwing a ServerlessError is passed through by the wrapper function", async () => {
    try {
      const restore = helpers.captureStdout();
      const wrapped = wrapper(handlerFnWithServerlessError);
      restore();
      await wrapped(
        { headers: { "X-Correlation-Id": CORRELATION_ID } } as IAwsLambdaProxyIntegrationRequest,
        {
          awsRequestId: AWS_REQUEST_ID,
          functionName: FUNCTION_NAME,
        } as IAwsLambdaContext
      );
    } catch (error) {
      if (isServerlessError(error)) {
        expect(error.name).toBe("ServerlessError");
        expect(error.httpStatus).toBe(ERROR_CODE);
        expect(error.correlationId).toBe(CORRELATION_ID);
        expect(error.awsRequestId).toBe(AWS_REQUEST_ID);
      } else {
        throw new Error("Error should have been an UnknownError");
      }
    }
  });
  it("throwing an Error should be caught by error handler and rethrown as UnknownError", async () => {
    const restore = helpers.captureStdout();
    const wrapped = wrapper(genHandlerWithDefaultErrorHandling());
    restore();
    const req = {
      headers: { "X-Correlation-Id": CORRELATION_ID },
    } as IAwsLambdaProxyIntegrationRequestV2;
    const ctx = {
      awsRequestId: AWS_REQUEST_ID,
      functionName: FUNCTION_NAME,
    } as IAwsLambdaContext;

    try {
      await wrapped(req, ctx);
      throw new Error("Wrapper should have thrown error");
    } catch (error) {
      expect(error).toBeInstanceOf(UnknownError);
      if (isUnknownError(error)) {
        expect(error.classification).toBe("wrapper-fn/unknown-error");
        expect(error.httpStatus).toBe(500);
      }
    }
  });

  it("setting the defaultErrorCode allows unknown errors to take explicit http status code", async () => {
    const restore = helpers.captureStdout();
    const wrapped = wrapper(genHandlerWithDefaultErrorHandling(666));
    restore();
    const req = {
      headers: { "X-Correlation-Id": CORRELATION_ID },
    } as IAwsLambdaProxyIntegrationRequestV2;
    const ctx = {
      awsRequestId: AWS_REQUEST_ID,
      functionName: FUNCTION_NAME,
    } as IAwsLambdaContext;

    try {
      await wrapped(req, ctx);
      throw new Error("Wrapper should have thrown error; avoiding this error");
    } catch (error) {
      expect(error).toBeInstanceOf(UnknownError);
      if (isUnknownError(error)) {
        expect(error.classification).toBe("wrapper-fn/unknown-error");
        expect(error.httpStatus).toBe(666);
      }
    }
  });

  it("Default error handler can 'correct' the error and result in a successful return", async () => {
    const restore = helpers.captureStdout();
    const handler: IErrorHandlerFunction<string> = async () => "hello world";
    const wrapped = wrapper(genHandlerWithDefaultErrorHandling(400, handler));
    restore();
    const req = {
      headers: { "X-Correlation-Id": CORRELATION_ID },
    } as IAwsLambdaProxyIntegrationRequestV2;
    const ctx = {
      awsRequestId: AWS_REQUEST_ID,
      functionName: FUNCTION_NAME,
    } as IAwsLambdaContext;

    const response = await wrapped(req, ctx);
    expect(response).toBe("hello world");
  });
});
