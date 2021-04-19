"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForDataFile = void 0;
const inquirer = require("inquirer");
const index_1 = require("./index");
/**
 * Asks the user to choose an AWS region
 */
async function askForDataFile(listOfFiles) {
    const files = listOfFiles ? listOfFiles : await index_1.getDataFiles();
    const question = {
        type: "list",
        name: "file",
        message: "What data file would you like?",
        default: files[0],
        choices: files
    };
    const answer = await inquirer.prompt(question);
    return answer.file;
}
exports.askForDataFile = askForDataFile;
