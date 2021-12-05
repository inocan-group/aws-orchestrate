/* eslint-disable unicorn/import-style */
import { join } from "path";
import { findHandlerFunctions } from "~/devops/utils";

describe("findFunctions()", () => {
  it("all TS files with valid exports are returned", async () => {
    const fns = findHandlerFunctions(join(process.cwd(), "test/data/handlers/**/*.ts"));
    const files = fns.map((i) => i.file);
    expect(files).toInclude("./test/data/handlers/foo.ts");
    expect(files).toInclude("./test/data/handlers/for-real/foo.ts");
    expect(files).toInclude("./test/data/handlers/bar.ts");
    expect(files).toInclude("./test/data/handlers/noConfig.ts");

    expect(files).not.toInclude("./test/data/handlers/fake.ts");
    expect(files).not.toInclude("./test/data/handlers/index.ts");
    expect(files).not.toInclude("./test/data/handlers/nonsense/a.ts");
    expect(files).not.toInclude("./test/data/handlers/nonsense/b.ts");
    expect(files).not.toInclude("./test/data/handlers/nonsense/c.ts");
  });
});
