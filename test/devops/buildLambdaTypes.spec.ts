/* eslint-disable unicorn/import-style */
import { join, relative } from "path";
import { exists, unlink } from "fs";
import { findHandlerFunctions, buildLambdaTypes } from "~/devops/utils";
import { promisify } from "util";
const [existance, remove] = [promisify(exists), promisify(unlink)];

describe("buildLambdaTypes()", () => {
  it("enumeration created and data structure valid", async () => {
    const filename = join(relative(process.cwd(), "src/types"), "devops-types.ts");
    try {
      await remove(filename);
    } catch {}

    const fns = findHandlerFunctions(join(process.cwd(), "test/data/handlers/**/*.ts"));
    const location = buildLambdaTypes(
      fns,
      {
        buildDirectory: "test/data",
        defaults: { memorySize: 1024 },
        additionalFunctions: [],
        handlerLocation: "test/data/handlers",
      },
      {}
    );

    // default location
    expect(location).toBe(filename);
    // type file exists
    expect(await existance(filename)).toBe(true);
  });
});
