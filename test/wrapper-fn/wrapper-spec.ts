import { IHandlerFunction, isApiGatewayResponse, IWrapperContext } from "~/types";
import { isServerlessError, ServerlessError, wrapper } from "~/index";
import { DEFAULT_ERROR_CODE } from "~/wrapper-fn/util/ErrorMeta";
import { SimpleApiGatewayEvent_V2, SimpleEvent } from "./data/test-events";

interface IRequest {
  foo: string;
  bar: number;
}

interface IResponse {
  testing: boolean;
  request: IRequest;
  context: IWrapperContext<any, any>;
}

/** returns the sent in event and context */
const handlerFn: IHandlerFunction<IRequest, IResponse> = async (request, context) => {
  return { testing: true, request, context };
};

/** handler which throws base Error */
const handlerErrorFn: IHandlerFunction<IRequest, IResponse> = async (_event, _context) => {
  throw new Error("this is an error god dammit");
};

/**
 * handler which throws a ServerlessError
 */
const handlerServerlessErrorFn: IHandlerFunction<IRequest, IResponse> = async (_evt, _ctx) => {
  throw new ServerlessError(404, "explicit throw of a ServerlessError", "test/serverless-error");
};

const handlerErrorFnWithDefaultChanged: IHandlerFunction<IRequest, IResponse> = async (_event, context) => {
  context.errorMgmt.setDefaultErrorCode(400);
  throw new Error("this is an error god dammit");
};

const simpleEvent: IRequest = {
  foo: "foo is foo",
  bar: 456,
};

const handleErrorFnWithErrorInMessage: IHandlerFunction<IRequest, IResponse> = (_event, context) => {
  context.errorMgmt.addHandler(401, { messageContains: "help me" }, { callback: () => false });
  const e = new Error("help me") as Error & { code: string };
  e.code = "secret-code";
  e.name = "named and shamed";
  throw e;
};

describe("Handler Wrapper => ", () => {
  it("By default the 'callbackWaitsForEmptyEventLoop' is set to \"false\"", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper<IRequest, IResponse>(async (request, context) => {
      expect(context.callbackWaitsForEmptyEventLoop).toBe(false);
      return { request, context, testing: true };
    });
    const results = await wrapped(simpleEvent, {} as any);
    expect(results).toBeObject();
    expect((results as IResponse).context.callbackWaitsForEmptyEventLoop).toBe(false);
  });

  it("Wrapper consumes a valid handler function and events passed down are strongly typed", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerFn);

    const results = await wrapped(simpleEvent, {} as any);

    expect(results).toHaveProperty("request");
    expect(results).toHaveProperty("context");
  });

  it("A bare request works", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerFn);
    const results = (await wrapped(simpleEvent, {} as any)) as IResponse;

    expect(results).toBeObject();

    expect(results).toHaveProperty("request");
    expect(results).toHaveProperty("context");

    expect(results.request.foo).toBe(simpleEvent.foo);
    expect(results.request.bar).toBe(simpleEvent.bar);

    expect(results.context.headers).toBeObject();
    expect(Object.keys(results.context.headers)).toHaveLength(0);
  });

  it("A handler which throws a ServerlessError is accepted and thrown", async () => {
    const wrapped = wrapper(handlerServerlessErrorFn);
    try {
      await wrapped(simpleEvent, {} as any);
      expect.fail("The handler function should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
      if (isServerlessError(error)) {
        expect(error.name).toBe("ServerlessError");
      } else {
        expect.fail("The isServerlessError type guard failed");
      }
    }
  });

  it("A handler which throws a ServerlessError but is called via API Gateway returns an error response", async () => {
    const wrapped = wrapper(handlerServerlessErrorFn);
    try {
      const event = SimpleApiGatewayEvent_V2(SimpleEvent);
      const result = await wrapped(event, {} as any);
      expect(result).toHaveProperty("statusCode");
      if (isApiGatewayResponse(result)) {
        expect(result.statusCode).toBe(403);
        expect(typeof result.body).toBe("string");
      } else {
        expect.fail("The type guard for an API Gateway should not have failed");
      }
    } catch (error) {
      expect.fail(
        `a ServerlessError thrown in handler should not result in the wrapper throwing an error when called from API Gateway, instead got error: ${error.message}`
      );
    }
  });

  it("Unhandled error in function results in defaultCode and error proxied", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFn);

    try {
      await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (error) {
      expect(error.code).toBe("Error");
      expect(error.name).toBe("unhandled-error");
      expect(error.httpStatus).toBe(DEFAULT_ERROR_CODE);
    }
  });

  it("Unhandled error has defaultCode modified when defaults are changed", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFnWithDefaultChanged);

    try {
      await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (error) {
      expect(error.code).toBe("Error");
      expect(error.name).toBe("unhandled-error");
      expect(error.httpStatus).toBe(400);
    }
  });

  it("Known error with callback that does NOT resolve results in appropriate response", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFnWithKnownErrors(false, true));

    try {
      await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (error) {
      expect(error.name).toBe("known");
      expect(error.httpStatus).toBe(404);
    }
  });

  it("Known error with callback that does resolve results in appropriate response", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFnWithKnownErrors(true, true));

    try {
      const response = await wrapped({ foo: "foo", bar: 888 }, {} as any);
      // error is handled
      expect(response).toBeUndefined();
    } catch {
      throw new Error("there should not have been an error when callback resolves the error");
    }
  });

  it("Known error is identified with part of 'message'", async () => {
    const wrapped = wrapper(handleErrorFnWithErrorInMessage);
    try {
      await wrapped({ foo: "foo", bar: 777 }, {} as any);
      throw new Error("the above call should have errored out");
    } catch (error) {
      expect(error.code).toBe("secret-code");
      expect(error.name).toBe("named and shamed");
      expect(error.httpStatus).toBe(401);
    }
  });
});
