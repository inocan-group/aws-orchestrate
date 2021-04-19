"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalOptions = exports.globalAndLocalOptions = void 0;
const chalk_1 = __importDefault(require("chalk"));
const getCommandInterface_1 = require("./getCommandInterface");
/**
 * A list of all options from all commands (including global options)
 */
async function globalAndLocalOptions(optsSet, fn) {
    let options = [];
    const cmdDefn = fn ? getCommandInterface_1.getCommandInterface(fn) : {};
    if (cmdDefn.options) {
        const localOptions = typeof cmdDefn.options === "object"
            ? cmdDefn.options
            : await cmdDefn.options(optsSet);
        const localNames = localOptions.map((i) => i.name);
        const nonInterferingGlobal = exports.globalOptions.filter((i) => !localNames.includes(i.name));
        options = localOptions.concat(nonInterferingGlobal);
    }
    else {
        options = exports.globalOptions;
    }
    return options;
}
exports.globalAndLocalOptions = globalAndLocalOptions;
exports.globalOptions = [
    {
        name: "output",
        alias: "o",
        type: String,
        group: "global",
        description: "sends output to the filename specified (in JSON format)",
        typeLabel: "<filename>",
    },
    {
        name: "quiet",
        alias: "q",
        type: Boolean,
        group: "global",
        description: chalk_1.default `stops all output to {italic stdout}`,
    },
    {
        name: "verbose",
        alias: "v",
        type: Boolean,
        group: "global",
        description: "makes the output more verbose",
    },
    {
        name: "help",
        alias: "h",
        type: Boolean,
        group: "global",
        description: "shows help for given command",
    },
];
