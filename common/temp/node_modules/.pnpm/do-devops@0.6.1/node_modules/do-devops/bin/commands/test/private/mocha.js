"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const globby_1 = __importDefault(require("globby"));
const path_1 = require("path");
const askForSpecificTests_1 = require("./askForSpecificTests");
const shared_1 = require("../../../shared");
const async_shelljs_1 = require("async-shelljs");
const testName_1 = require("./testName");
/** runs the Mocha command to execute the tests */
const tsExecution = async (fns) => {
    /** the tsconfig-paths npm package can provide convenient path alias which work with ts-node */
    const hasTsconfigPaths = shared_1.hasDevDependency("tsconfig-paths");
    const mochaRequires = hasTsconfigPaths
        ? ["ts-node/register", "tsconfig-paths/register"]
        : ["ts-node/register"];
    const command = `yarn mocha --no-timeouts ${mochaRequires
        .map((i) => `-r ${i}`)
        .join(" ")} --exit ${fns.join(" ")}`;
    if (hasTsconfigPaths) {
        console.log(chalk_1.default `- using {blue tsconfig-paths} with mocha to support path aliases. {grey remove the npm package to have this behavior stop}\n`);
    }
    return async_shelljs_1.asyncExec(`yarn mocha --no-timeouts ${mochaRequires.map((i) => `-r ${i}`).join(" ")} --exit ${fns.join(" ")}`);
};
const mocha = async (args) => {
    const config = await shared_1.getConfig();
    const allTests = await globby_1.default([path_1.posix.join(config.test.testDirectory, config.test.testPattern)]);
    let selectedTests = [];
    if (args.length > 0) {
        args.forEach((searchTerm) => {
            const found = allTests.filter((t) => t.includes(searchTerm));
            if (found.length === 0) {
                console.log(chalk_1.default `- the {italic.blue ${searchTerm}} search term found no matches in the available tests`);
            }
            else {
                selectedTests = selectedTests.concat(...found);
            }
        });
        if (selectedTests.length === 0) {
            const selectedTests = await askForSpecificTests_1.askForSpecificTests(askForSpecificTests_1.SpecificTestReason.noResultsFound, allTests);
        }
        if (selectedTests.length === 0) {
            console.log(chalk_1.default `- no tests matched; valid tests include:\n`);
            console.log(chalk_1.default `{dim ${allTests
                .map((t) => testName_1.testName(t, config.test.testPattern).padEnd(20))
                .join("\t")}}`);
        }
        else {
            console.log(chalk_1.default `- ${"\uD83C\uDFC3" /* run */} running {bold ${String(selectedTests.length)}} ({italic of} {bold ${String(allTests.length)}}) mocha tests: {grey ${selectedTests
                .map((t) => testName_1.testName(t, config.test.testPattern))
                .join(", ")}}`);
        }
    }
    else {
        selectedTests = allTests;
        if (selectedTests.length === 0) {
            console.log(chalk_1.default `- There were {red.bold NO} mocha unit tests in the "${config.test.testDirectory}" directory [ pattern: {grey.italic ${config.test.testPattern}} ]\n`);
            process.exit();
        }
        else {
            console.log(chalk_1.default `- ${"\uD83C\uDFC3" /* run */} running {italic all} {bold ${String(selectedTests.length)}} mocha tests: {grey ${selectedTests
                .map((t) => testName_1.testName(t, config.test.testPattern))
                .join(", ")}}`);
        }
    }
    console.log();
    await tsExecution(selectedTests).catch((e) => {
        console.log(chalk_1.default `\n- ${"\uD83D\uDE21" /* angry */}  tests completed but {red errors} were encountered`);
        process.exit(1);
    });
    console.log(chalk_1.default `- ${"\uD83C\uDF89" /* party */}  all tests completed successfully\n`);
    process.exit();
};
exports.default = mocha;
