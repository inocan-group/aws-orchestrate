/* eslint-disable unicorn/import-style */
import { resolve } from "path";
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  testEnvironment: "jsdom",
  // roots: ["tests", "src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/on-hold/"],
  moduleNameMapper: {
    "^[/]{0,1}~/(.*)$": resolve(process.cwd(), "src", "$1"),
  },

  testMatch: ["**/?(*[-.])+(spec|test).ts"],
  setupFilesAfterEnv: ["jest-extended/all"],
  // setupFiles: ["./test/testSetup.ts"],
};

export default config;
