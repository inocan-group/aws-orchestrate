#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const process = __importStar(require("process"));
const shared_1 = require("./shared");
const getCommands_1 = require("./shared/getCommands");
const help_1 = require("./commands/help");
const commandLineArgs = require("command-line-args");
(async () => {
    const command = [{ name: "command", defaultOption: true }, ...shared_1.globalOptions];
    const mainCommand = commandLineArgs(command, { stopAtFirstUnknown: true });
    const cmd = (mainCommand._all || {}).command;
    let argv = mainCommand._unknown || [];
    let opts = mainCommand.global;
    console.log(chalk_1.default.bold.white(`do ${chalk_1.default.green.italic.bold(cmd ? cmd + " " : "Help")}\n`));
    if (!cmd) {
        await help_1.help(opts);
    }
    if (getCommands_1.getCommands().includes(cmd)) {
        opts =
            commandLineArgs(await shared_1.globalAndLocalOptions({}, cmd), {
                partial: true,
            }) || {};
        let subModule = shared_1.getCommandInterface(cmd);
        const subModuleArgv = opts._unknown.filter((i) => i !== cmd);
        const subModuleOpts = opts._all;
        if (subModuleOpts.help) {
            await help_1.help(subModuleOpts, cmd);
        }
        try {
            await subModule.handler(subModuleArgv, subModuleOpts);
        }
        catch (e) {
            console.log(chalk_1.default `\n{red An Error has occurred while running: {italic {bold do ${cmd}}}}`);
            console.log(`- ${e.message}`);
            console.log(chalk_1.default `{grey   ${e.stack}}\n`);
            process.exit();
        }
    }
    else {
        console.log(`${chalk_1.default.bold.red("DO:")} "${cmd}" is an unknown command! \n\n` +
            `- Valid command syntax is: ${chalk_1.default.bold("do [command] <options>")}\n  where valid commands are: ${chalk_1.default.italic(getCommands_1.getCommands().sort().join(", "))}\n` +
            `- If you want more help use the ${shared_1.inverted(" --help ")} option\n`);
    }
})();
