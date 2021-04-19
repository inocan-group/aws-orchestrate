"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const inquirer = require("inquirer");
async function deployBoth() {
    console.log(chalk_1.default `- This repo appears to be {italic both} a {bold Serverless} and an {bold NPM} project.`);
    console.log(chalk_1.default `- In the future you can use the {blue --target [ {dim serverless,npm} ]} switch to be explicit.`);
    console.log();
    const question = {
        type: "list",
        name: "type",
        message: chalk_1.default `Choose the {italic type} of build you want:`,
        choices: ["serverless", "npm"],
        default: "serverless",
    };
    const answer = await inquirer.prompt(question);
    return answer.type;
}
exports.default = deployBoth;
