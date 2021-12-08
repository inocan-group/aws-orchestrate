/* eslint-disable unicorn/import-style */
import { join } from "path";
import { createStack } from "~/devops/builders/createStack";
describe("createStack() builder", () => {
  it("stack with no config is enough to generate starting config", () => {
    const s = createStack("my-stack", "profile") //
      .addResource()
      .prepareLambda((f) => f.handlerLocation(join(process.cwd(), "test/data/handlers")));

    console.log(s.stack);
  });
});
