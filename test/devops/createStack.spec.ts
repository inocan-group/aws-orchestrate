/* eslint-disable unicorn/import-style */
import { join } from "path";
import { DynamoTable } from "~/devops";
import { createStack } from "~/devops/builders/createStack";
describe("createStack() builder", () => {
  it("stack with no config is enough to generate starting config", () => {
    const s = createStack("my-stack", "profile") //
      .prepareLambda((f) => f.handlerLocation(join(process.cwd(), "test/data/handlers")));

    console.log(s.stack);
  });

  it("stack with dynamoDB table added becomes part of config", () => {
    const s = createStack("my-stack", "profile") //
      .resources(DynamoTable("customers"))
      .prepareLambda((f) => f.handlerLocation(join(process.cwd(), "test/data/handlers")));

    console.log(s.stack);
  });

  it.todo("stack with dynamoDB table is resolved to stage-based name at run-time", () => {
    //
  });
});
