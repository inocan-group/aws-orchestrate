"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = void 0;
const chalk_1 = __importDefault(require("chalk"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const index_1 = require("../shared/ui/index");
async function help(opts, fn) {
    const { commands, description, syntax, options } = await getHelpMeta(opts, fn);
    const sections = [
        {
            header: "Description",
            content: description,
        },
        {
            header: "Syntax",
            content: syntax,
        },
    ];
    if (commands && commands.length > 0) {
        sections.push({
            header: fn ? `${fn.toUpperCase()} Sub-Commands` : "Commands",
            content: commands,
        });
    }
    if (fn) {
        sections.push({
            header: "Options",
            optionList: options,
        });
    }
    try {
        console.log(command_line_usage_1.default(sections));
    }
    catch (e) {
        console.log(`  - ${"\uD83D\uDCA9" /* poop */}  ${chalk_1.default.red("Problem displaying help:")} ${e.message}\n`);
        console.log(chalk_1.default.grey(e.stack));
    }
    console.log();
    process.exit();
}
exports.help = help;
async function getHelpMeta(opts, fn) {
    try {
        const syntax = await index_1.getSyntax(fn);
        const commands = await index_1.getHelpCommands(fn);
        const options = await index_1.getOptions(opts, fn);
        const description = await index_1.getDescription(opts, fn);
        return { commands, options, syntax, description };
    }
    catch (e) {
        console.log(`  - ${"\uD83D\uDCA9" /* poop */}  ${chalk_1.default.red.bold("Problem getting help meta:")} ${e.messsage}\n`);
        console.log(chalk_1.default.grey(e.stack));
        process.exit();
    }
}
