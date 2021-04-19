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
exports.findAllHandlerFiles = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const path = __importStar(require("path"));
/**
 * Finds all typescript files in the `src/handlers`
 * directory which have a **handler** export.
 */
async function findAllHandlerFiles() {
    const glob = path.join(process.env.PWD, "/src/handlers/**/*.ts");
    const files = fast_glob_1.default.sync(glob);
    const handlers = [];
    console.log(files);
    for await (const file of files) {
        console.log(file);
        const ref = await Promise.resolve().then(() => __importStar(require(file)));
        if (ref.handler) {
            handlers.push({ file, ref });
        }
    }
    console.log(handlers.map((i) => i.file));
}
exports.findAllHandlerFiles = findAllHandlerFiles;
