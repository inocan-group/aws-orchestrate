"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askBuildTool = void 0;
const chalk_1 = __importDefault(require("chalk"));
const _types_1 = require("../../@types");
const index_1 = require("../../shared/index");
const index_2 = require("./index");
const inquirer = require("inquirer");
/**
 * Asks for the primary build tool the user wants to use
 * for the repo. It will also return the value for further
 * processing.
 */
async function askBuildTool(isServerless) {
    const packages = Object.keys(index_1.getPackageJson().devDependencies);
    const findLikely = (exclude = null) => packages.find((i) => i === "bili" && i !== exclude)
        ? "bili"
        : packages.find((i) => i === "rollup" && i !== exclude)
            ? "rollup"
            : packages.find((i) => i === "webpack" && i !== exclude)
                ? "webpack"
                : packages.find((i) => i === "typescript" && i !== exclude)
                    ? "typescript"
                    : undefined;
    const mostLikely = findLikely();
    const alternative = findLikely(mostLikely);
    const ifTypescriptMessage = chalk_1.default `{reset
    
  {bold {white Note:}} since this is a {bold {blue Serverless}} project you may consider 
  using "none" to only build the {italic serverless.yml} file at build time. Alternatively,
  if you choose "webpack" it will allow you will be able to build both by adding the {blue 
  --force} parameter.

  }`;
    const message = chalk_1.default `Choose a build tool for this repo [ {grey {italic suggestion: }${mostLikely ? [mostLikely, alternative].filter((i) => i).join(", ") : "[ {grey no suggestions"}} ]${isServerless ? ifTypescriptMessage : ""}`;
    const choices = Object.keys(_types_1.BuildTool);
    const baseProfileQuestion = {
        type: "list",
        name: "buildTool",
        message,
        choices,
        default: mostLikely || choices[0],
    };
    const answer = await inquirer.prompt(baseProfileQuestion);
    await index_2.saveToolToRepoConfig(answer.buildTool);
    return answer.buildTool;
}
exports.askBuildTool = askBuildTool;
