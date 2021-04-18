import { IAwsApiGatewayResponse } from "common-types";
import { IHandlerFunction, isApiGatewayResponse } from "~/types";
import { isServerlessError, ServerlessError, wrapper } from "~/index";
import { DEFAULT_ERROR_CODE } from "~/wrapper-fn/util/ErrorMeta";
import { IRequest, IResponse, SimpleApiGatewayEvent_V2, simpleEvent } from "../data/test-events";

/** returns the sent in event and context */
const handlerFn: IHandlerFunction<IRequest, IResponse> = async (request, context) => {
  return { testing: true, request, context };
};

/** handler which throws base Error */
const handlerErrorFn: IHandlerFunction<IRequest, IResponse> = async (_event, _context) => {
  throw new Error("this is an error god dammit");
};

const handlerWithKnownErrors: IHandlerFunction<IRequest, IResponse> = async (_event, context) => {
  context.errorMgmt.addHandler(
    404,
    { messageContains: "missing" },
    { callback: async () => false }
  );
  throw new Error("missing something");
};

/**
 * handler which throws a ServerlessError
 */
const handlerServerlessErrorFn: IHandlerFunction<IRequest, IResponse> = async (_evt, _ctx) => {
  throw new ServerlessError(404, "explicit throw of a ServerlessError", "test/serverless-error");
};

const handlerWithDefaultCodeChanged: IHandlerFunction<IRequest, IResponse> = async (
  _event,
  context
) => {
  context.errorMgmt.setDefaultErrorCode(400);
  throw new Error("this is an error god dammit");
};

const handlerWithCallback: IHandlerFunction<IRequest, IResponse> = (_event, context) => {
  context.errorMgmt.addHandler(
    401,
    { messageContains: "help me" },
    { callback: async () => false }
  );
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
  });

  it("A handler which throws a ServerlessError is accepted and thrown", async () => {
    const wrapped = wrapper(handlerServerlessErrorFn);
    try {
      await wrapped(simpleEvent, {} as any);
      throw new Error("The handler function should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
      if (isServerlessError(error)) {
        expect(error.name).toBe("ServerlessError");
      } else {
        throw new Error("The isServerlessError type guard failed");
      }
    }
  });

  it("A handler which throws a ServerlessError but is called via API Gateway returns an error response", async () => {
    const wrapped = wrapper(handlerServerlessErrorFn);
    let result: IResponse | IAwsApiGatewayResponse;
    try {
      const event = SimpleApiGatewayEvent_V2(simpleEvent);
      result = await wrapped(event, {} as any);
    } catch (error) {
      throw new Error(
        `a ServerlessError thrown in handler should not result in the wrapper throwing an error when called from API Gateway, instead got error: ${error.message}`
      );
    }
    expect(result).toHaveProperty("statusCode");
    if (isApiGatewayResponse(result)) {
      expect(result.statusCode).toBe(404);
      expect(typeof result.body).toBe("string");
    } else {
      throw new Error("The type guard for an API Gateway should not have failed");
    }
  });

  it("Unhandled error in function results in defaultCode and error proxied", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFn);

    try {
      await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (error) {
      expect(error.code).toBe("unknown-error");
      expect(error.name).toBe("UnknownError");
      expect(error.httpStatus).toBe(DEFAULT_ERROR_CODE);
    }
  });

  it("Unhandled error has defaultCode modified when defaults are changed", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerWithDefaultCodeChanged);

    try {
      await wrapped({ foo: "foo", bar: 888 }, {} as any);
      throw new Error("handler should have failed");
    } catch (error) {
      expect(error.code).toBe("unknown-error");
      expect(error.name).toBe("UnknownError");
      expect(error.httpStatus).toBe(400);
    }
  });

  it("Known error is identified", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerWithKnownErrors);

    try {
      await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (error) {
      expect(error.name).toBe("KnownError");
      expect(error.httpStatus).toBe(404);
    }
  });

  it("Known error is identified with part of 'message'", async () => {
    const wrapped = wrapper(handlerWithCallback);
    try {
      await wrapped({ foo: "foo", bar: 777 }, {} as any);
      throw new Error("the above call should have errored out");
    } catch (error) {
      expect(error.code).toBe("secret-code");
      expect(error.httpStatus).toBe(401);
    }
  });
});
