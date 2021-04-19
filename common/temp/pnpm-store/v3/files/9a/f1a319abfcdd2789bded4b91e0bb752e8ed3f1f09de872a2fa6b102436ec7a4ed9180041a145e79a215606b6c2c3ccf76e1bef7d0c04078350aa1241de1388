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
exports.clearOldFiles = void 0;
const path = __importStar(require("path"));
const fs_1 = require("fs");
const async_shelljs_1 = require("async-shelljs");
function clearOldFiles() {
    const typeFile = path.join(process.env.PWD, "src/@types/fns.ts");
    const inlineFile = path.join(process.env.PWD, "serverless-config/functions/inline.ts");
    const webpackFile = path.join(process.env.PWD, "serverless-config/functions/webpack.ts");
    const files = [typeFile, inlineFile, webpackFile];
    files.forEach((f) => {
        if (fs_1.existsSync(f)) {
            async_shelljs_1.rm(f);
        }
    });
}
exports.clearOldFiles = clearOldFiles;
