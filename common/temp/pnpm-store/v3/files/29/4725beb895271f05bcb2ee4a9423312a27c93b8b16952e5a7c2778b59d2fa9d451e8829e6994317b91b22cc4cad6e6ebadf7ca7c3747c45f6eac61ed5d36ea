"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAutoindexFile = void 0;
const fs_1 = require("fs");
function isAutoindexFile(filename) {
    return /^\/\/\s*#autoindex/.test(fs_1.readFileSync(filename, "utf-8"));
}
exports.isAutoindexFile = isAutoindexFile;
