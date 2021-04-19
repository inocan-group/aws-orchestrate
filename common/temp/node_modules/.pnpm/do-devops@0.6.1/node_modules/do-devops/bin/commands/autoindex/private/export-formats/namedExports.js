"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.namedExports = void 0;
const index_1 = require("../index");
/**
 * Given a set of files and directories that are exportable, this function will
 * boil this down to just the string needed for the autoindex block.
 */
function namedExports(exportable, opts = {}) {
    const file = (file) => `export * from "./${opts.preserveExtension ? index_1.removeExtension(file) + ".js" : index_1.removeExtension(file)}";`;
    const dir = (dir) => `export * from "./${dir}/index${opts.preserveExtension ? ".js" : ""}";`;
    return index_1.exportTemplate(exportable, opts, { file, dir });
}
exports.namedExports = namedExports;
