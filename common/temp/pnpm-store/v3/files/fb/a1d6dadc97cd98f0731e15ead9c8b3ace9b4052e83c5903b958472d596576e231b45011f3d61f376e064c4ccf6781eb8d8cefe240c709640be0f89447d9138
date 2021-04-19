"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.namedExports = void 0;
const index_1 = require("../index");
const exportTemplate_1 = require("./exportTemplate");
/**
 * Given a set of files and directories that are exportable, this function will
 * boil this down to just the string needed for the autoindex block.
 */
function namedExports(exportable, opts = {}) {
    const file = (file) => `export {  default as ${index_1.removeExtension(file)}} from "./${opts.preserveExtension ? index_1.removeExtension(file) + ".js" : index_1.removeExtension(file)}";`;
    const dir = (dir) => `export * from "./${dir}/index${opts.preserveExtension ? ".js" : ""}";`;
    return exportTemplate_1.exportTemplate(exportable, opts, file, dir);
    // if (exportable.files.length > 0) {
    //   contentLines.push(`\n// local file exports`);
    //   contentLines.push(`// files: ${exportable.files.join(", ")}`);
    // }
    // exportable.files.forEach((file) => {
    //   contentLines.push(
    //     `export {  default as ${removeExtension(file)}} from "./${
    //       opts.preserveExtension ? removeExtension(file) + ".js" : removeExtension(file)
    //     }";`
    //   );
    // });
    // if (exportable.dirs.length > 0) {
    //   contentLines.push(`\n// directory exports`);
    //   contentLines.push(`// directories: ${exportable.dirs.join(", ")}`);
    // }
    // exportable.dirs.forEach((dir) => {
    //   contentLines.push(`export * from "./${dir}/index${opts.preserveExtension ? ".js" : ""}";`);
    // });
    // return contentLines.join("\n");
}
exports.namedExports = namedExports;
