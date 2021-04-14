import * as helpers from "../helpers/helpers";

import { ServerlessError } from "~/errors";
import { wrapper } from "~/wrapper-fn";
import { IHandlerFunction } from "~/types";
import {
  IAwsLambdaContext,
  IAwsLambdaProxyIntegrationRequest,
  IAwsLambdaProxyIntegrationRequestV2,
} from "common-types";

const CORRELATION_ID = "c-123";
const AWS_REQUEST_ID = "1234";
const FUNCTION_NAME = "myHandlerFunction";
const ERROR_CODE = 403;
const handlerFnWithServerlessError: IHandlerFunction<void, void> = async (_req, _ctx) => {
  throw new ServerlessError(ERROR_CODE, "a test of an explicit error throw", "testing");
};

const handlerWithDefaultErrorHandler: IHandlerFunction<void, void> = async (_req, ctx) => {
  ctx.errorMgmt.setDefaultHandler((error: Error) => {
    expect(error.name).toBe("Error");
    expect(error.message).toBe("a test of an explicit error throw");
    expect(error.stack).not.toBeUndefined();
    return true;
  });
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
      expect(error.name).toBe("ServerlessError");
      expect(error.httpStatus).toBe(ERROR_CODE);
      expect(error.correlationId).toBe(CORRELATION_ID);
      expect(error.awsRequestId).toBe(AWS_REQUEST_ID);
    }
  });
  it("throwing an error should be catch by default error handler", async () => {
    const restore = helpers.captureStdout();
    const wrapped = wrapper(handlerWithDefaultErrorHandler);
    restore();
    const req = { headers: { "X-Correlation-Id": CORRELATION_ID } } as IAwsLambdaProxyIntegrationRequestV2;
    const ctx = {
      awsRequestId: AWS_REQUEST_ID,
      functionName: FUNCTION_NAME,
    } as IAwsLambdaContext;

    expect.toThrowWithMessage(await wrapped(req, ctx), "a test of an explicit error throw");
  });
});
