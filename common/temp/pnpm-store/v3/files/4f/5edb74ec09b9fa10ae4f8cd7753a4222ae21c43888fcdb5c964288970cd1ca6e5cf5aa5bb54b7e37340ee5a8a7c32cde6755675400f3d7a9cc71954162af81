"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askHowToHandleMonoRepoIndexing = void 0;
const inquirer = require("inquirer");
async function askHowToHandleMonoRepoIndexing(pkgs) {
    const choices = ["ALL", ...pkgs];
    const message = `This repo appears to be a monorepo. Please choose\nwhich repo(s) you want to run autoindex on:`;
    const question = {
        message,
        type: "list",
        name: "repo",
        choices,
        default: "ALL",
    };
    return (await inquirer.prompt(question)).repo;
}
exports.askHowToHandleMonoRepoIndexing = askHowToHandleMonoRepoIndexing;
