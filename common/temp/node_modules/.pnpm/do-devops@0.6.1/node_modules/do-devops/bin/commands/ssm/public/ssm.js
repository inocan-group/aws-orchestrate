"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const commandLineArgs = require("command-line-args");
const chalk = require("chalk");
const shared_1 = require("../../../shared");
const index_1 = require("../private/index");
const index_2 = require("./index");
async function handler(argv, ssmOptions) {
    const subCommand = argv.shift();
    const opts = commandLineArgs(index_2.options, {
        argv: argv,
        partial: true,
    });
    if (!Object.keys(index_1.subCommands).includes(subCommand)) {
        console.log(`- please choose a ${chalk.italic("valid")} ${chalk.bold.yellow("SSM")} sub-command: ${Object.keys(index_1.subCommands).join(", ")}`);
        console.log();
        process.exit();
    }
    const serverless = await shared_1.isServerless();
    if (serverless && serverless.isUsingTypescriptMicroserviceTemplate && !serverless.hasServerlessConfig) {
        await shared_1.buildLambdaTypescriptProject();
    }
    try {
        await index_1.subCommands[subCommand].execute(argv, ssmOptions);
    }
    catch (e) {
        console.log(chalk `{red - Ran into error when running "ssm ${subCommand}":}\n  - ${e.message}\n`);
        console.log(chalk `{grey - ${e.stack}}`);
        process.exit(1);
    }
}
exports.handler = handler;
