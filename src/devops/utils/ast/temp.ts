/* eslint-disable unicorn/import-style */
import { join } from "path";
import { parseSourceFile } from "./parseSourceFile";

(async () => {
  const s = parseSourceFile(join(process.cwd(), "./test/data/handlers/implicitFoo.ts"));
  console.log(s.variables);
})();
