"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForStage = void 0;
const inquirer = require("inquirer");
/**
 * Asks the user to choose an AWS region
 */
async function askForStage(message = "What stage are you working with?") {
    const question = {
        type: "list",
        name: "stage",
        message,
        default: "dev",
        choices: ["dev", "test", "stage", "prod"],
    };
    const answer = await inquirer.prompt(question);
    return answer.stage;
}
exports.askForStage = askForStage;
