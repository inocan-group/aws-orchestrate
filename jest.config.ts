import type { InitialOptionsTsJest } from "ts-jest/dist/types";
// eslint-disable-next-line unicorn/import-style
import { resolve } from "path";

const config: InitialOptionsTsJest = {
  verbose: true,
  preset: "ts-jest/presets/js-with-ts",
  testMatch: ["**/test/?(*-)+(spec|test).ts", "**/src/?(*-)+(spec|test).ts"],
  moduleNameMapper: {
    "^[/]{0,1}~/(.*)$": resolve(process.cwd(), "src", "$1"),
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "ts-jest",
  },

  transformIgnorePatterns: ["/node_modules/(?!(entity-decode))"],
  setupFilesAfterEnv: ["jest-extended"],
  testEnvironment: "node",
};

export default config;
