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
exports.createFunctionEnum = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const findHandlerConfig_1 = require("../../ast/findHandlerConfig");
const util_1 = require("util");
const write = util_1.promisify(fs_1.writeFile);
/**
 * creates an enumeration with all of the _functions_ which have
 * been defined in the project
 */
async function createFunctionEnum(handlers) {
    const header = `export enum AvailableFunction {
`;
    const footer = `
}
  
export type IAvailableFunction = keyof typeof AvailableFunction;
`;
    let body = [];
    handlers.forEach((handler) => {
        const config = findHandlerConfig_1.findHandlerConfig(handler.source);
        if (!config) {
            console.log(chalk_1.default `- ${"\uD83D\uDE21" /* angry */} also excluding the {italic ${handler.source
                .split("/")
                .pop()}} in the generated enumeration of handlers`);
        }
        else {
            const fn = handler.fn;
            const comment = config.config.description ? config.config.description : `${fn} handler`;
            body.push(`
  /**
   * ${comment}
   **/
  ${fn} = "${fn}"`);
        }
    });
    const fileText = `${header}${body.join(",")}${footer}`;
    if (!fs_1.existsSync(path.join(process.cwd(), "/src/@types"))) {
        fs_1.mkdirSync(path.join(process.cwd(), "/src/@types"));
    }
    await write(path.resolve(path.join(process.cwd(), "/src/@types/functions.ts")), fileText, {
        encoding: "utf-8",
    });
    return fileText;
}
exports.createFunctionEnum = createFunctionEnum;
