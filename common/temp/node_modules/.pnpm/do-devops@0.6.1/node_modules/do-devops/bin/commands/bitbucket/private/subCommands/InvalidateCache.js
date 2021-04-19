"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const handler = function InvalidateCache(opts) {
    try {
        fs_1.rmdirSync(`/opt/atlassian/pipelines/agent/cache/node_modules`);
        console.log(chalk_1.default `- The {blue node_modules} cache has been invalidated!`);
    }
    catch (e) {
        console.warn(`There was an error while trying to invalidate the bitbucket cache:\n\n${e.message}`);
    }
    return 0;
};
exports.handler = handler;
