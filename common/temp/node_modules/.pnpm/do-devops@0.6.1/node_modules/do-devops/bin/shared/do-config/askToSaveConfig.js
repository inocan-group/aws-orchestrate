"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askToSaveConfig = void 0;
const inquirer = require("inquirer");
const shared_1 = require("../../shared");
var SaveChoice;
(function (SaveChoice) {
    SaveChoice["project"] = "save to project's config (avail to all repo users)";
    SaveChoice["user"] = "save as my personal default (saved to ~/do.config.js)";
    SaveChoice["doNotSave"] = "do not save";
})(SaveChoice || (SaveChoice = {}));
/**
 * Asks the user if they'd like to save information to their project or user
 * `do.config.js` file.
 */
async function askToSaveConfig(configPath, value, descriptor = "this") {
    const question = {
        type: "list",
        name: "saveTo",
        message: `Would you like to save ${descriptor} to your do-devops config?`,
        default: SaveChoice.project,
        choices: [SaveChoice.project, SaveChoice.user, SaveChoice.doNotSave],
    };
    const answer = await inquirer.prompt(question);
    if (answer.saveTo !== SaveChoice.doNotSave) {
        shared_1.saveToConfig(configPath, value, answer.saveTo === SaveChoice.project ? "project" : "user");
    }
    return answer.saveTo;
}
exports.askToSaveConfig = askToSaveConfig;
