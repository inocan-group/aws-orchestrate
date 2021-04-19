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
exports.readDataFile = void 0;
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const index_1 = require("./index");
/**
 * Reads a file from the `test/data` directory
 */
async function readDataFile(file, defaultExtension) {
    if (defaultExtension && defaultExtension.slice(0, 1) === ".") {
        defaultExtension = defaultExtension.slice(1);
    }
    let filename = path.join(process.cwd(), "test/data", file);
    if (defaultExtension && !file.includes("." + defaultExtension)) {
        filename += "." + defaultExtension;
    }
    return index_1.readFile(filename);
}
exports.readDataFile = readDataFile;
