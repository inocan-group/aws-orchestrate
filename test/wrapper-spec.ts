import { expect } from "chai";
import { IHandlerContext, IHandlerFunction } from "../src/@types";
import { wrapper, IOrchestratedRequest } from "../src/index";
import { LambdaSequence } from "../src/LambdaSequence";
import { HandledError } from "../src/errors/HandledError";
import { UnhandledError } from "../src/errors/UnhandledError";
import { DEFAULT_ERROR_CODE } from "../src/errors/ErrorMeta";

interface IRequest {
  foo: string;
  bar: number;
}

interface IResponse {
  testing: boolean;
  request: IRequest;
  context: IHandlerContext;
}

/** returns the sent in event and context */
const handlerFn: IHandlerFunction<IRequest, IResponse> = async (
  request,
  context
) => {
  return { testing: true, request, context };
};

const handlerErrorFn: IHandlerFunction<IRequest, IResponse> = async (
  event,
  context
) => {
  throw new Error("this is an error god dammit");
};

const handlerErrorFnWithDefaultChanged: IHandlerFunction<
  IRequest,
  IResponse
> = async (event, context) => {
  context.errorMgmt.setDefaultErrorCode(400);
  throw new Error("this is an error god dammit");
};

const handlerErrorFnWithKnownErrors: (
  cbResult: boolean,
  isHandled: boolean
) => IHandlerFunction<IRequest, IResponse> = (
  cbResult,
  isHandled = false
) => async (event, context) => {
  context.errorMgmt.addHandler(
    404,
    { errorClass: HandledError },
    { callback: e => cbResult }
  );
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
  bar: 456
};

const orchestrateEvent: IOrchestratedRequest<IRequest> = {
  type: "orchestrated-message-body",
  sequence: LambdaSequence.add("fn1")
    .add("fn2", { foo: 1, bar: 2 })
    .toObject(),
  headers: {
    "Content-Type": "application/json",
    "X-Correlation-Id": "12345"
  },
  body: simpleEvent
};

describe("Handler Wrapper => ", () => {
  it('By default the "callbackWaitsForEmptyEventLoop" is set to "false"', async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper<IRequest, IResponse>(async (request, context) => {
      expect(context.callbackWaitsForEmptyEventLoop).to.equal(false);
      return { request, context, testing: true };
    });
    const results = await wrapped(simpleEvent, {} as any);
    expect(results).to.be.an("object");
    expect(
      (results as IResponse).context.callbackWaitsForEmptyEventLoop
    ).to.equal(false);
  });

  it("Wrapper consumes a valid handler function and events passed down are strongly typed", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerFn);

    const results = await wrapped(simpleEvent, {} as any);

    expect(results).to.haveOwnProperty("request");
    expect(results).to.haveOwnProperty("context");
    expect((results as IResponse).context).to.haveOwnProperty("isSequence");
    expect((results as IResponse).context).to.haveOwnProperty("isDone");
  });

  it("A bare request works", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerFn);
    const results = (await wrapped(simpleEvent, {} as any)) as IResponse;

    expect(results).to.be.an("object");

    expect(results).to.haveOwnProperty("request");
    expect(results).to.haveOwnProperty("context");

    expect(results.request.foo).to.equal(simpleEvent.foo);
    expect(results.request.bar).to.equal(simpleEvent.bar);

    expect(results.context.headers).is.an("object");
    expect(Object.keys(results.context.headers)).has.lengthOf(0);
  });

  it.skip("An orchestrated request works", async () => {
    process.env.AWS_STAGE = "dev";
    process.env.AWS_REGION = "us-west-2";
    process.env.AWS_ACCOUNT = "123456";
    process.env.APP_NAME = "foobar";

    const wrapped = wrapper(handlerFn);
    const results = (await wrapped(orchestrateEvent, {} as any)) as IResponse;

    expect(results).to.be.an("object");

    console.log(results);

    expect(results).to.haveOwnProperty("request");
    expect(results).to.haveOwnProperty("context");

    expect(results.request.foo).to.equal(simpleEvent.foo);
    expect(results.request.bar).to.equal(simpleEvent.bar);

    expect(results.context.headers).is.an("object");
    expect(results.context.headers["X-Correlation-Id"]).is.a("string");
    expect(results.context.headers["Content-Type"])
      .is.a("string")
      .and.equal("application/json");

    expect(results.context.sequence).is.an.instanceOf(LambdaSequence);
    const seqSummary = results.context.sequence.toObject();
    console.log(seqSummary);

    expect(seqSummary.isSequence).to.equal(true);
  });

  it("Unhandled error in function results in defaultCode and error proxied", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFn);

    try {
      const response = await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (e) {
      expect(e.code).to.equal("Error");
      expect(e.name).to.equal("unhandled-error");
      expect(e.httpStatus).to.equal(DEFAULT_ERROR_CODE);
    }
  });

  it("Unhandled error has defaultCode modified when defaults are changed", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFnWithDefaultChanged);

    try {
      const response = await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (e) {
      expect(e.code).to.equal("Error");
      expect(e.name).to.equal("unhandled-error");
      expect(e.httpStatus).to.equal(400);
    }
  });

  it("Known error with callback that does NOT resolve results in appropriate response", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFnWithKnownErrors(false, true));

    try {
      const response = await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (e) {
      expect(e.name).to.equal("known");
      expect(e.httpStatus).to.equal(404);
    }
  });

  it("Known error with callback that does resolve results in appropriate response", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFnWithKnownErrors(true, true));

    try {
      const response = await wrapped({ foo: "foo", bar: 888 }, {} as any);
      // error is handled
      expect(response).to.equal(undefined);
    } catch (e) {
      throw new Error(
        "there should not have been an error when callback resolves the error"
      );
    }
  });

  it("Known error is identified with part of 'message'", async () => {
    const fn: IHandlerFunction<IRequest, IResponse> = async (
      event,
      context
    ) => {
      context.errorMgmt.addHandler(
        401,
        { messageContains: "help me" },
        { callback: () => false }
      );
      const e = Error("help me") as Error & { code: string };
      e.code = "secret-code";
      e.name = "named and shamed";
      throw e;
    };

    const wrapped = wrapper(fn);
    try {
      const response = await wrapped({ foo: "foo", bar: 777 }, {} as any);
      throw new Error("the above call should have errored out");
    } catch (e) {
      expect(e.code).to.equal("secret-code");
      expect(e.name).to.equal("named and shamed");
      expect(e.httpStatus).to.equal(401);
    }
  });
});
