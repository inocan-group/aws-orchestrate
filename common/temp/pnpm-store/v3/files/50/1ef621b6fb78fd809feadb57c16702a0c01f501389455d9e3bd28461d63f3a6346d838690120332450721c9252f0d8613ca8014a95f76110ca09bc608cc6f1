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
exports.getValidServerlessHandlers = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const path = __importStar(require("path"));
const parseFile_1 = require("./parseFile");
const file_1 = require("../file");
/**
 * Gets a list of all typescript files under the `src/handlers`
 * directory that have a `handlers` export.
 */
function getValidServerlessHandlers() {
    const allFiles = fast_glob_1.default.sync(path.join(process.env.PWD, "/src/handlers/**/*.ts"));
    return allFiles.reduce((agg, curr) => {
        let ast;
        let status = "starting";
        try {
            ast = parseFile_1.parseFile(curr);
            status = "file-parsed";
            if (!ast.program.body[0].source) {
                console.log(chalk_1.default `{grey - the file {blue ${file_1.relativePath(curr)}} has no source content; will be ignored}`);
                return agg;
            }
            const loc = ast.program.body[0].source.loc;
            status = "loc-identified";
            const handler = loc.tokens.find((i) => i.value === "handler");
            status = handler ? "handler-found" : "handler-missing";
            if (handler) {
                if (!Array.isArray(agg)) {
                    throw new Error(`Found a handler but somehow the file aggregation is not an array! ${handler}`);
                }
                agg.push(curr);
            }
            return agg;
        }
        catch (e) {
            console.log(chalk_1.default `- Error processing  {red ${file_1.relativePath(curr)}} [s: ${status}]: {grey ${e.message}}`);
            return agg;
        }
    }, []);
}
exports.getValidServerlessHandlers = getValidServerlessHandlers;
