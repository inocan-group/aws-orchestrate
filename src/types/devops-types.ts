import type { IHandlerFunction } from "aws-orchestrate/devops";

export const enum HandlerFunction {
  /** Something not so profound */
  Bar = "Bar",
  /** Something profound */
  Foo = "Foo",
  /** Something profound */
  ImplicitFoo = "ImplicitFoo",
  /** no comment provided */
  NoConfig = "NoConfig",
  /** Something profound */
  Foey = "Foey"
}

/** a dictionary which acts as a lookup for the handler functions defined */
export const handlerFnLookup: Record<HandlerFunction, IHandlerFunction> = {
    /** Something not so profound */
    Bar: {
      source: "./test/data/handlers/bar.ts",
      target: "./test/data/bar.js",
      config: {"description":"Something not so profound"}
    },
    /** Something profound */
    Foo: {
      source: "./test/data/handlers/foo.ts",
      target: "./test/data/foo.js",
      config: {"description":"Something profound","events":[{"http":{"method":"post","path":"/sms/chat","cors":true,"authorizer":"${self:custom.authorizer}"}}]}
    },
    /** Something profound */
    ImplicitFoo: {
      source: "./test/data/handlers/implicitFoo.ts",
      target: "./test/data/implicitFoo.js",
      config: {"description":"Something profound","memorySize":1024,"events":[{"http":{"method":"post","path":"/sms/chat","cors":true,"authorizer":"${self:custom.authorizer}"}}]}
    },
    /** NoConfig */
    NoConfig: {
      source: "./test/data/handlers/noConfig.ts",
      target: "./test/data/noConfig.js",
      config: {}
    },
    /** Something profound */
    Foey: {
      source: "./test/data/handlers/for-real/foey.ts",
      target: "./test/data/for-real/foey.js",
      config: {"description":"Something profound","events":[{"http":{"method":"post","path":"/sms/chat","cors":true,"authorizer":"${self:custom.authorizer}"}}]}
    },
  };
