// bili.config.ts
import { Config } from "bili";

const config: Config = {
  input: "src/index.ts",
  output: {
    format: ["esm", "cjs"],
    dir: "dist/"
  }
};

export default config;
