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
exports.getDataFiles = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
/**
 * Gets a list of data files from the
 * `test/data` directory.
 */
async function getDataFiles(opts = {}) {
    const glob = path.join(process.cwd(), "test/data", opts.fileType ? `**/*.${opts.fileType}` : `**/*`);
    const results = await fast_glob_1.default(glob);
    return strip(opts)(results);
}
exports.getDataFiles = getDataFiles;
function strip(opts) {
    return (results) => {
        if (opts.filterBy) {
            results = results.filter((i) => i.includes(opts.filterBy));
        }
        if (opts.stripFileExtension) {
            results = results.map((i) => i.replace(/(.*)\.\w*$/, "$1"));
        }
        const prefix = process.cwd() + "/test/data/";
        return results.map((i) => i.replace(prefix, ""));
    };
}
