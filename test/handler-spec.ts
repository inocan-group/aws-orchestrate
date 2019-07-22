import { expect } from "chai";
import { IHandlerContext, IHandlerFunction } from "../src/@types";
import { wrapper } from "../src/index";
import { IAWSLambdaProxyIntegrationRequest } from "common-types";
import { HandledError } from "../src/errors/HandledError";
import { UnhandledError } from "../src/errors/UnhandledError";

interface IRequest {
  foo: string;
  bar: number;
}

interface IResponse {
  event: IRequest;
  context: IHandlerContext;
}

const handlerFn: IHandlerFunction<IRequest, IResponse> = async (
  event,
  context
) => {
  return { event, context };
};

const handlerErrorFn: IHandlerFunction<IRequest, IResponse> = async (
  event,
  context
) => {
  throw new Error("this is an error god dammit");
  return { event, context };
};

const handlerErrorFnWithDefaultChanged: IHandlerFunction<
  IRequest,
  IResponse
> = async (event, context) => {
  context.errorMeta.setDefaultErrorCode(400);
  throw new Error("this is an error god dammit");
  return { event, context };
};

const handlerErrorFnWithKnownErrors: (
  cbResult: boolean,
  isHandled: boolean
) => IHandlerFunction<IRequest, IResponse> = (
  cbResult,
  isHandled = false
) => async (event, context) => {
  context.errorMeta.add(
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
    const e = new Error("saw that one coming!");
    e.name = "unknown";
    throw new UnhandledError(BOGUS_ERROR_CODE, e);
  }
  return { event, context };
};

const event1: IRequest = {
  foo: "foo is foo",
  bar: 456
};

describe("Handler Wrapper => ", () => {
  it('By default the "callbackWaitsForEmptyEventLoop" is set to "false"', async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper<IRequest, IResponse>(async (event, context) => {
      expect(context.callbackWaitsForEmptyEventLoop).to.equal(false);
      return { event, context };
    });
    const results = await wrapped(event1, {} as any);
    expect(results).to.be.an("object");
    expect(
      (results as IResponse).context.callbackWaitsForEmptyEventLoop
    ).to.equal(false);
  });

  it("Wrapper consumes a valid handler function and events passed down are strongly typed", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerFn);

    const results = await wrapped(event1, {} as any);

    expect(results).to.haveOwnProperty("event");
    expect(results).to.haveOwnProperty("context");
    expect((results as IResponse).context).to.haveOwnProperty("isSequence");
    expect((results as IResponse).context).to.haveOwnProperty("isDone");
  });

  it("An ApiGateway response returns a JSON parsable response", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerFn);

    const results = await wrapped(
      {
        headers: { "Content-type": "text/html" },
        body: JSON.stringify(event1)
      } as any,
      {} as any
    );

    expect(results).to.be.a("string");

    const parsedResults = JSON.parse(results as string);

    expect(parsedResults).to.haveOwnProperty("data");
    expect(parsedResults.data).to.haveOwnProperty("event");
    expect(parsedResults.data.event.foo).to.equal("foo is foo");
    expect(parsedResults.data).to.haveOwnProperty("context");
  });

  it("Unhandled error in function results in defaultCode and error proxied", async () => {
    process.env.AWS_STAGE = "dev";
    const wrapped = wrapper(handlerErrorFn);

    try {
      const response = await wrapped({ foo: "foo", bar: 888 }, {} as any);
    } catch (e) {
      expect(e.code).to.equal("Error");
      expect(e.name).to.equal("unhandled-error");
      expect(e.httpStatus).to.equal(500);
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
      context.errorMeta.add(
        401,
        { messageContains: "help me" },
        { callback: () => false }
      );
      const e = Error("help me") as Error & { code: string };
      e.code = "secret-code";
      e.name = "named and shamed";
      throw e;
      return { event, context };
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
