import { IHandlerFunction, IWrapperContext } from "~/types";
import { wrapper, IOrchestratedRequest, LambdaSequence } from "../src/index";
import { HandledError } from "../src/errors/HandledError";
import { UnhandledError } from "../src/errors/UnhandledError";
import { DEFAULT_ERROR_CODE } from "../src/wrapper-fn/util/ErrorMeta";

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

const handlerErrorFn: IHandlerFunction<IRequest, IResponse> = async (_event, _context) => {
  throw new Error("this is an error god dammit");
};

const handlerErrorFnWithDefaultChanged: IHandlerFunction<IRequest, IResponse> = async (_event, context) => {
  context.errorMgmt.setDefaultErrorCode(400);
  throw new Error("this is an error god dammit");
};

const handlerErrorFnWithKnownErrors: (
  cbResult: boolean,
  isHandled: boolean
) => IHandlerFunction<IRequest, IResponse> = (cbResult, isHandled = false) => async (_event, context) => {
  context.errorMgmt.addHandler(404, { errorClass: HandledError }, { callback: (_e) => cbResult });
  const BOGUS_ERROR_CODE = 399;

  if (isHandled) {
    const e = new Error("saw that one coming!");
    e.name = "known";
    throw new HandledError(BOGUS_ERROR_CODE, e, context.log.getContext());
  } else {
    const e = new Error("unhandled error!");
    e.name = "unknown";
    throw new UnhandledError(BOGUS_ERROR_CODE, e);
  }
};

const simpleEvent: IRequest = {
  foo: "foo is foo",
  bar: 456,
};

const orchestrateEvent: IOrchestratedRequest<IRequest> = {
  type: "orchestrated-message-body",
  sequence: LambdaSequence.add("fn1").add("fn2", { foo: 1, bar: 2 }).toObject(),
  headers: {
    "Content-Type": "application/json",
    "X-Correlation-Id": "12345",
  },
  body: simpleEvent,
};

const handleErrorFnWithErrorInMessage: IHandlerFunction<IRequest, IResponse> = (_event, context) => {
  context.errorMgmt.addHandler(401, { messageContains: "help me" }, { callback: () => false });
  const e = new Error("help me") as Error & { code: string };
  e.code = "secret-code";
  e.name = "named and shamed";
  throw e;
};

describe("Handler Wrapper => ", () => {
  it('By default the "callbackWaitsForEmptyEventLoop" is set to "false"', async () => {
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
    expect((results as IResponse).context).toHaveProperty("isSequence");
    expect((results as IResponse).context).toHaveProperty("isDone");
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

  it.skip("An orchestrated request works", async () => {
    process.env.AWS_STAGE = "dev";
    process.env.AWS_REGION = "us-west-2";
    process.env.AWS_ACCOUNT = "123456";
    process.env.APP_NAME = "foobar";

    const wrapped = wrapper(handlerFn);
    const results = (await wrapped(orchestrateEvent, {} as any)) as IResponse;

    expect(results).toBeObject();

    console.log(results);

    expect(results).toHaveProperty("request");
    expect(results).toHaveProperty("context");

    expect(results.request.foo).toBe(simpleEvent.foo);
    expect(results.request.bar).toBe(simpleEvent.bar);

    expect(results.context.headers).toBeObject();
    expect(results.context.headers["X-Correlation-Id"]).toBeInstanceOf("string");
    expect(results.context.headers["Content-Type"]).toBeString();
    expect(results.context.headers["Content-Type"]).toEqual("application/json");

    expect(results.context.sequence).toBeInstanceOf(LambdaSequence);
    const seqSummary = results.context.sequence.toObject();
    console.log(seqSummary);

    expect(seqSummary.isSequence).toBe(true);
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
