"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOrphanedIndexFile = void 0;
const fs_1 = require("fs");
function isOrphanedIndexFile(filename) {
    return /^\/\/\s*#autoindex.*/.test(fs_1.readFileSync(filename, "utf-8"));
}
exports.isOrphanedIndexFile = isOrphanedIndexFile;
