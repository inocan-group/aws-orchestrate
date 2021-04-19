"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitLastCommit = void 0;
const async_shelljs_1 = require("async-shelljs");
async function getGitLastCommit() {
    const result = await async_shelljs_1.asyncExec("git rev-parse --short HEAD ", {
        silent: true
    });
    return result.replace("\n", "");
}
exports.getGitLastCommit = getGitLastCommit;
