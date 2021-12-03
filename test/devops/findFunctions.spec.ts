import { findFunctions } from "../../src/devops/utils/findFunctions";

describe("findFunctions()", () => {
  it("all TS files with valid exports are returned", async () => {
    await findFunctions();
  });
});
