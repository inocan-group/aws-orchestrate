import { IServerlessFunction, prepareFunctions } from "~/devops";

describe("prepareFunctions()", () => {
  it("function defaults are stored correctly in config", () => {
    const fns = prepareFunctions();
    const config = fns.defaults({ memorySize: 1024 }).config;

    expect(config.additionalFunctions).toEqual([]);
    expect(config.defaults.memorySize).toBe(1024);
  });

  it("additionalFunctions are stored correctly in config", () => {
    const fns = prepareFunctions();
    const fnDefn: IServerlessFunction = {
      name: "foo",
      runtime: "java8",
      handler: "dist/foo.js",
    };
    const config = fns.additionalFunctions([fnDefn]).config;

    expect(config.additionalFunctions).toEqual([fnDefn]);
    expect(config.defaults).toEqual({});
  });

  it("both defaults and additionalFunctions can be set in config", () => {
    const fns = prepareFunctions();
    const fnDefn: IServerlessFunction = {
      name: "foo",
      runtime: "java8",
      handler: "dist/foo.js",
    };
    const config = fns.additionalFunctions([fnDefn]).defaults({ memorySize: 1024 }).config;
    expect(config.additionalFunctions).toEqual([fnDefn]);
    expect(config.defaults.memorySize).toBe(1024);
  });
});
