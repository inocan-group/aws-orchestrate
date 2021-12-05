import { createStack } from "~/devops/builders/createStack";
describe("createStack() builder", () => {
  it("stack with no config is enough to generate starting config", () => {
    const s = createStack("my-stack", "testing");

    console.log(s.stack);
  });
});
