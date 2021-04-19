"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitTags = void 0;
const index_1 = require("./index");
async function gitTags(baseDir) {
    baseDir = baseDir ? baseDir : process.cwd();
    const g = index_1.git(baseDir);
    return g.tags();
}
exports.gitTags = gitTags;
