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
exports.saveFunctionsTypeDefinition = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const __1 = require("../..");
const util_1 = require("util");
const writeFile = util_1.promisify(fs.writeFile);
/**
 * Once a build is complete, this function will review the
 * _functions_ and _stepFunctions_ and then create a file
 * `src/@types/fns.ts` which has a **enum** for both types of
 * functions. This will allow completeness checking in
 * conductors and in other cases where you want to be made
 * aware at _design time_ when your reference to functions
 * is incorrect.
 *
 * Note that errors encountered are trapped so as to not block
 * completion but a warning message will be sent to the console.
 */
async function saveFunctionsTypeDefinition(config) {
    try {
        const functions = config.functions ? Object.keys(config.functions) : false;
        const stepFunctions = config.stepFunctions && config.stepFunctions.stateMachines
            ? Object.keys(config.stepFunctions.stateMachines)
            : false;
        let contents = "";
        if (functions) {
            contents += "export enum AvailableFunctions {";
            functions.forEach((f, i) => {
                const description = config.functions[f].description
                    ? config.functions[f].description
                    : false;
                contents += description ? `\n  /**\n   * ${description}\n   **/` : "";
                const comma = i === functions.length - 1 ? "" : ",";
                contents += `\n  ${f} = "${f}"${comma}`;
            });
            contents += "\n};\n";
        }
        if (stepFunctions) {
            // TODO: implement
        }
        const dir = path.join(process.cwd(), "src/@types");
        const filename = path.join(dir, "build.ts");
        await __1.ensureDirectory(dir);
        await writeFile(filename, contents, { encoding: "utf-8" });
    }
    catch (e) {
        console.log(chalk_1.default `- Attempt to save {italic type definitions} for {bold functions} and {bold stepFunctions} failed; this will be ignored for now so build can continue.`);
        console.log(chalk_1.default `- The actual error received was: {dim ${e.message}}`);
    }
}
exports.saveFunctionsTypeDefinition = saveFunctionsTypeDefinition;
