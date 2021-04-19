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
exports.writeInlineFunctions = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const writeFile = util_1.promisify(fs.writeFile);
/**
 * Writes to the `serverless-config/functions/inline.ts` file
 * all of the handler functions which were found off the "handlers"
 * directory.
 *
 * The configuration will only include the reference to the `handler`
 * file unless the function exports a `config` property to express
 * other configuration properties.
 */
async function writeInlineFunctions(handlers, functionRoot = "src", fileName = "inline") {
    let contents = 'import { IServerlessFunction } from "common-types";\n\n';
    const fnNames = [];
    for (const handler of handlers) {
        const localPath = handler.file
            .replace(/.*src\//, `${functionRoot}/`)
            .replace(".ts", "");
        const functionName = handler.file.split("/").pop().replace(".ts", "");
        fnNames.push(functionName);
        let config = {
            handler: `${localPath}.handler`,
        };
        // if (handler.ref.config) {
        //   config = { ...config, ...handler.ref.config.con };
        // }
        contents += `const ${functionName}: IServerlessFunction = {\n`;
        Object.keys(config).forEach((key) => {
            let value = config[key];
            if (typeof value === "string") {
                value = `"${value.replace(/"/g, '\\"')}"`;
            }
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            contents += `  ${key}: ${value},\n`;
        });
        contents += "}\n\n";
    }
    contents += `export default {\n  ${fnNames.join(",\n  ")}\n}`;
    await writeFile(path.join(process.cwd(), `serverless-config/functions/${fileName}.ts`), contents, {
        encoding: "utf-8",
    });
}
exports.writeInlineFunctions = writeInlineFunctions;
