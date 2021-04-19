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
exports.getOptions = exports.getExamples = exports.getDescription = exports.getSyntax = exports.getHelpCommands = void 0;
const chalk_1 = __importDefault(require("chalk"));
const index_1 = require("../../shared/index");
async function getHelpCommands(fn) {
    let meta = [];
    let bold = false;
    if (fn) {
        const defn = await Promise.resolve().then(() => __importStar(require(`../../commands/${fn}`)));
        meta = defn.commands ? defn.commands : [];
    }
    else {
        for (const cmd of index_1.getCommands()) {
            const ref = await Promise.resolve().then(() => __importStar(require(`../../commands/${cmd}`)));
            meta.push({
                name: cmd,
                summary: bold
                    ? chalk_1.default.bold(ref.description ? ref.description() : "")
                    : ref.description
                        ? typeof ref.description === "function"
                            ? await ref.description()
                            : ref.description
                        : "",
            });
        }
    }
    return formatCommands(meta);
}
exports.getHelpCommands = getHelpCommands;
/**
 * Formats commands so that:
 *
 * 1. alternating white/dim per line item
 * 2. multi-line descriptions are truncated to first line
 */
function formatCommands(cmds) {
    let dim = false;
    return cmds.map((cmd) => {
        cmd.name = dim ? `{dim ${cmd.name}}` : cmd.name;
        const summary = Array.isArray(cmd.summary) ? cmd.summary.split("\n")[0] : cmd.summary;
        console.log(summary, cmd.summary);
        cmd.summary = dim ? `{dim ${summary}}` : summary;
        dim = !dim;
        return cmd;
    });
}
/**
 * Gets the syntax for the help system for both "global help"
 * as well as on a per function basis. The syntax for a function
 * can be manually set by providing a `syntax` symbol on the
 * command. If not provided a default syntax will be used.
 */
async function getSyntax(fn) {
    if (!fn) {
        return "do [command] <options>";
    }
    const defn = await Promise.resolve().then(() => __importStar(require(`../../commands/${fn}`)));
    const hasSubCommands = defn.subCommands ? true : false;
    return defn.syntax ? defn.syntax : `do ${fn} ${hasSubCommands ? "[command] " : ""}<options>`;
}
exports.getSyntax = getSyntax;
/**
 * Gets the "description" content for the help area
 */
async function getDescription(opts, fn) {
    if (!fn) {
        return `DevOps toolkit [ ${chalk_1.default.bold.italic("do")} ] is a simple CLI interface intended to automate most of the highly repeatable tasks on your team.`;
    }
    const defn = await Promise.resolve().then(() => __importStar(require(`../../commands/${fn}`)));
    const hasDescription = defn.description ? true : false;
    const defnIsFunction = typeof defn.description === "function";
    return hasDescription
        ? defnIsFunction
            ? await defn.description(opts)
            : defn.description
        : `Help content for the {bold do}'s ${chalk_1.default.bold.green.italic(fn)} command.`;
}
exports.getDescription = getDescription;
/**
 *
 * @param opts
 * @param fn
 */
async function getExamples(opts, fn) {
    // nothing to do if no function is chosen
    if (fn) {
        const defn = await Promise.resolve().then(() => __importStar(require(`../../commands/${fn}`)));
        const hasExamples = defn.examples ? true : false;
        const defnIsFunction = typeof defn.examples === "function";
        if (hasExamples) {
            if (!defnIsFunction && !Array.isArray(defn.examples)) {
                throw new Error(`Getting help on "${fn}" has failed because the examples section -- while configured -- is of the wrong format! Should be a function returning an array or an array of .`);
            }
            const examples = defnIsFunction ? defn.examples(opts) : defn.examples;
        }
        return hasExamples ? (defnIsFunction ? await defn.description(opts) : defn.description) : ``;
    }
}
exports.getExamples = getExamples;
async function getOptions(opts, fn) {
    // let options: OptionDefinition[] = [];
    // if (fn) {
    //   const defn = await import(`../../commands/${fn}`);
    //   if (defn.options) {
    //     options = options.concat(typeof defn.options === "function" ? await defn.options(opts) : defn.options);
    //   }
    // }
    // options = options.concat(globalOptions);
    // return options;
    return index_1.globalAndLocalOptions(opts, fn);
}
exports.getOptions = getOptions;
