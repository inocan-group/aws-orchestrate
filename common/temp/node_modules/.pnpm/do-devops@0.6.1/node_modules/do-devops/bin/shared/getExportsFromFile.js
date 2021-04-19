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
exports.getExportsFromFile = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
/**
 * Returns an array of _exports_ that a given file provides
 *
 * @param file the filename and relative path of the file being analyized
 * @param filter you can optionally provide a filter which will be run over
 * the exports so you can isolate the exports only to those you are interested in
 */
async function getExportsFromFile(file, filter = () => true) {
    const srcDir = path.join(process.env.PWD, "src");
    const exports = await Promise.resolve().then(() => __importStar(require(path.join("..", file.replace(srcDir, "").replace(".ts", "")))));
    return Object.keys(exports).reduce((agg, key) => {
        const value = exports[key];
        if (filter(value)) {
            agg[key] = {
                symbol: key,
                type: typeof value,
                props: typeof value === "object" ? Object.keys(value) : undefined,
            };
        }
        else {
            console.log(chalk_1.default.grey(`- ignoring the export "${key}" due to the filter condition`));
        }
        return agg;
    }, {});
}
exports.getExportsFromFile = getExportsFromFile;
