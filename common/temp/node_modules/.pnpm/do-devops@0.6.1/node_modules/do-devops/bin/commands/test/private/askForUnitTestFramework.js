"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForUnitTestFramework = void 0;
const inquirer = require("inquirer");
const shared_1 = require("../../../shared");
/**
 * Asks the user to choose an AWS profile
 */
async function askForUnitTestFramework() {
    const devDeps = Object.keys(shared_1.getPackageJson().devDependencies);
    const testFrameworks = ["mocha", "jest", "other"];
    const defaultFramework = devDeps.includes("mocha") ? "mocha" : devDeps.includes("jest") ? "jest" : "other";
    const framework = {
        name: "unitTestFramework",
        type: "list",
        choices: testFrameworks,
        message: "choose the unit testing framework you are using",
        default: defaultFramework,
        when: () => true,
    };
    const testLocations = ["test", "tests", "other"];
    const testLocation = {
        name: "testDirectory",
        type: "list",
        choices: testLocations,
        message: "choose the unit testing framework you are using",
        default: "test",
        when: () => true,
    };
    const testPatterns = [
        "**/*-spec.ts",
        "**/*.spec.ts",
        "**/*-test.ts",
        "**/*.test.ts",
        "**/*-spec.js",
        "**/*.spec.js",
        "**/*-test.js",
        "**/*.test.js",
    ];
    const testPattern = {
        name: "testPattern",
        type: "list",
        choices: testPatterns,
        message: "what pattern should identify a test file versus just a normal file",
        default: "**/*-spec.ts",
        when: () => true,
    };
    let answer = await inquirer.prompt([framework, testLocation, testPattern]);
    if (answer.testLocation === "other") {
        const freeformLocation = {
            name: "testDirectory",
            type: "input",
            message: "What is the path to your tests?",
        };
        answer = { ...answer, ...(await inquirer.prompt(freeformLocation)) };
    }
    return answer;
}
exports.askForUnitTestFramework = askForUnitTestFramework;
