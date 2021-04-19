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
exports.parseFile = void 0;
const recast = __importStar(require("recast"));
const fs_1 = require("fs");
/**
 * parses a given file (_path_ and _file_ name) into an AST
 * tree
 */
function parseFile(filename) {
    const fileContents = fs_1.readFileSync(filename, {
        encoding: "utf-8"
    });
    return filename.includes(".ts")
        ? recast.parse(fileContents, {
            parser: require("recast/parsers/typescript")
        })
        : recast.parse(fileContents);
}
exports.parseFile = parseFile;
