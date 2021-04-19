"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askUser = void 0;
const interactive_1 = require("../../../shared/interactive");
const inquirer_1 = require("inquirer");
async function askUser(profiles) {
    const question = interactive_1.checkboxQuestion({
        name: "profiles",
        message: `Choose the profiles you want ID's for`,
        choices: profiles,
    });
    const answer = await inquirer_1.prompt([question]);
    return answer.profiles;
}
exports.askUser = askUser;
