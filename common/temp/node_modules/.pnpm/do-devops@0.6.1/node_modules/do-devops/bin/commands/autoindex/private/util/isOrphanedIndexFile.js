"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOrphanedIndexFile = void 0;
const fs_1 = require("fs");
/**
 * Returns a boolean flag indicating whether the file is an
 * "orphaned" index file (e.g., index files below it in the
 * directory structure should ignore it)
 *
 * @param filename the filename to be tested
 */
function isOrphanedIndexFile(filename) {
    return /^\/\/\s*#autoindex.*orphan/.test(fs_1.readFileSync(filename, "utf-8"));
}
exports.isOrphanedIndexFile = isOrphanedIndexFile;
