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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const subCommands = __importStar(require("../private/subCommands/index"));
const chalk = require("chalk");
async function handler(argv, opts) {
    const subCommand = argv[0];
    if (!Object.keys(subCommands).includes(subCommand)) {
        throw new Error(chalk `The subcommand "${subCommand}" is unknown to do's {bold bitbucket} command! Valid subcommands include:\n\n{grey ${Object.keys(subCommands).join(", ")}}`);
    }
    const cmdDefn = subCommands[subCommand];
    process.exit(await cmdDefn.handler(opts));
}
exports.handler = handler;
