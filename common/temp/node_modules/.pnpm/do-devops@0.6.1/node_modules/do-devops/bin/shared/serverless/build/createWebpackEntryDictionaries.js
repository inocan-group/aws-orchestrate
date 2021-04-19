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
exports.useKey = exports.createWebpackEntryDictionaries = void 0;
const path = __importStar(require("path"));
const write_1 = require("../../file/write");
/**
 * Webpack can create named multiple entry points if the `entry` parameter
 * is passed a dictionary where the key is the module name (in Serverless
 * this would be the handler's name) and the value is then the full path to
 * the file.
 *
 * This function will, given a path to the source typescript files, produce
 * two dictionaries:
 *
 * 1. `webpack.ts-entry-points.json` - a dictionary that points to the handler's
 * typescript source
 * 2. `webpack.js-entry-points.json` - a dictionary that points to webpack's outputted
 * javascript files
 *
 * If you are using the `serverless-webpack` plugin you should use the former, if you
 * are managing the webpack process yourself then the latter is likely more appropriate.
 */
async function createWebpackEntryDictionaries(handlerFns) {
    const data = handlerFns.reduce((agg, f) => {
        const fn = f
            .split("/")
            .pop()
            .replace(".ts", "");
        const tsPath = "./" + path.relative(process.cwd(), f);
        const jsPath = tsPath
            .split("/")
            .pop()
            .replace(/(.*)/, ".webpack/$1")
            .replace(".ts", ".js");
        return agg.concat({ fn, tsPath, jsPath });
    }, []);
    await Promise.all([
        write_1.write("webpack.ts-entry-points.json", data.reduce(useKey("tsPath"), {})),
        write_1.write("webpack.js-entry-points.json", data.reduce(useKey("jsPath"), {}))
    ]);
}
exports.createWebpackEntryDictionaries = createWebpackEntryDictionaries;
function useKey(key) {
    return (agg, curr) => {
        agg[curr.fn] = curr[key];
        return agg;
    };
}
exports.useKey = useKey;
