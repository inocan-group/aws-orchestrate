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
exports.createInlineExports = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const common_types_1 = require("common-types");
const file_1 = require("../../file");
const index_1 = require("../../ast/index");
const do_config_1 = require("../../do-config");
const npm_1 = require("../../npm");
const path_1 = require("path");
const fs_1 = require("fs");
/**
 * Writes the serverless configuration file which contains
 * all the _inline_ function definitions found under `src/handlers`.
 *
 * **Note:** if the build tool is _webpack_ and the `serverless-webpack`
 * plugin is _not_ installed then it the inline functions will instead
 * be pointed to the transpiled location in the `.webpack` directory with
 * an `package: { artifact: fn.zip }`
 */
async function createInlineExports(handlers) {
    const bespokeWebpack = (await do_config_1.getConfig()).build.buildTool === "webpack" &&
        !npm_1.hasDevDependency("serverless-webpack");
    const header = 'import { IServerlessFunction } from "common-types";\n';
    let body = [];
    const config = [];
    handlers.forEach((handler) => {
        // const comments = findHandlerComments(handler);
        const handlerConfig = index_1.findHandlerConfig(handler.source, bespokeWebpack);
        if (handlerConfig) {
            config.push(handlerConfig);
        }
        else {
            console.log(chalk_1.default `- ${"\uD83D\uDCA9" /* poop */} the {red ${file_1.relativePath(handler.source)}} file will be ignored as a handler as it has no CONFIG section defined. This is probably a mistake!`);
        }
    });
    const exportSymbols = [];
    warnAboutMissingTyping(config);
    config.forEach((handler) => {
        if (common_types_1.isServerlessFunctionHandler(handler.config)) {
            const fnName = handler.config.handler
                .split("/")
                .pop()
                .replace(/\.[^.]+$/, "");
            exportSymbols.push(fnName);
            const symbol = `const ${fnName}: IServerlessFunction = { 
  ${objectPrint(handler.config)}
  }
  `;
            body.push(symbol);
        }
        else {
            console.warn(`[${handler.config.image}]: the serverless function passed into createInlineExports appears to define an "image" rather than a "handler". This should be investigated!`);
        }
    });
    const file = `
${header}
${body.join("\n")}

export default {
  ${exportSymbols.join(",\n\t")}
}`;
    fs_1.writeFileSync(path.join(process.env.PWD, "serverless-config/functions/inline.ts"), file, {
        encoding: "utf-8",
    });
}
exports.createInlineExports = createInlineExports;
function objectPrint(obj) {
    let contents = [];
    Object.keys(obj).forEach((key) => {
        let value = obj[key];
        if (typeof value === "string") {
            value = `"${value.replace(/"/g, '\\"')}"`;
        }
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        contents.push(`  ${key}: ${value}`);
        return contents.join(",\n\t");
    });
    return contents;
}
function convertToWebpackResource(fn) {
    return path_1.join(".webpack/", fn.split("/").pop().replace(".ts", ".js"));
}
function warnAboutMissingTyping(config) {
    const incorrectOrMissingTyping = config.filter((i) => i.interface !== "IHandlerConfig");
    if (incorrectOrMissingTyping.length > 0) {
        console.log(chalk_1.default `- there were ${String(incorrectOrMissingTyping.length)} handler functions who defined a {italic config} but did not type it as {bold IHandlerConfig}`);
        console.log(chalk_1.default `{grey - the function configs needing attention are: {italic ${incorrectOrMissingTyping
            .map((i) => common_types_1.isServerlessFunctionHandler(i.config) ? i.config.handler : i.config.image)
            .join(", ")}}}`);
    }
}
