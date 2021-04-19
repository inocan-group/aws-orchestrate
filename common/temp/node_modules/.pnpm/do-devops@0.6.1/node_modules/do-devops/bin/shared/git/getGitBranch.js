"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentGitBranch = void 0;
const git_1 = require("./git");
/**
 * returns the _current_ git branch in the given repo
 */
async function getCurrentGitBranch(baseDir) {
    baseDir = baseDir ? baseDir : process.cwd();
    const g = git_1.git(baseDir);
    const branch = await g.branch();
    return branch.current;
}
exports.getCurrentGitBranch = getCurrentGitBranch;
