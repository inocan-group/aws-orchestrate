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
exports.hasAwsProfileCredentialsFile = void 0;
const path = __importStar(require("path"));
const fs_1 = require("fs");
/**
 * Returns the path to the file if found, if not found then returns
 * `false`.
 */
function hasAwsProfileCredentialsFile() {
    const homedir = require("os").homedir();
    const filePath = path.join(homedir, ".aws/credentials");
    return fs_1.existsSync(filePath) ? filePath : false;
}
exports.hasAwsProfileCredentialsFile = hasAwsProfileCredentialsFile;
