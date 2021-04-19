"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForFunction = exports.askForFunctions = void 0;
const inquirer = require("inquirer");
const getLocalServerlessFunctionsFromServerlessYaml_1 = require("./getLocalServerlessFunctionsFromServerlessYaml");
/**
 * Asks the user to choose one or more handler functions
 */
async function askForFunctions(message = "Which functions do you want to use?", defaults = []) {
    const fns = Object.keys(await getLocalServerlessFunctionsFromServerlessYaml_1.getLocalServerlessFunctionsFromServerlessYaml());
    const question = {
        type: "checkbox",
        message,
        name: "fns",
        choices: fns,
        default: defaults
    };
    const answer = await inquirer.prompt(question);
    return answer.fns;
}
exports.askForFunctions = askForFunctions;
/**
 * Asks the user to choose one or more handler functions
 */
async function askForFunction(message = "Which function do you want to use?") {
    const fns = Object.keys(await getLocalServerlessFunctionsFromServerlessYaml_1.getLocalServerlessFunctionsFromServerlessYaml());
    const question = {
        type: "list",
        message,
        name: "fn",
        choices: fns
    };
    const answer = await inquirer.prompt(question);
    return answer.fn;
}
exports.askForFunction = askForFunction;
