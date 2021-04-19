"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightFilepath = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Uses the `chalk` utility to present a nicely formatted
 * filepath and file where the file name itself is highlighted
 */
function highlightFilepath(fp, color = ["dim", "blue"], highlight = ["bold", "blue"]) {
    let parts = fp.split(/[\/\\]/);
    const file = parts.pop();
    const path = parts.join("/").replace(/^(\S)/, "./$1");
    const baseFormat = color.reduce((acc, curr) => acc[curr], chalk_1.default);
    const highlightFormat = highlight.reduce((acc, curr) => acc[curr], chalk_1.default);
    return `${baseFormat(path + "/")}${highlightFormat(file)}`;
}
exports.highlightFilepath = highlightFilepath;
