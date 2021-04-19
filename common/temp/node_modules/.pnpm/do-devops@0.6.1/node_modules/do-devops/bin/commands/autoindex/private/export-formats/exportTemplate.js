"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTemplate = void 0;
const index_1 = require("../index");
/**
 * The general template used for all export types.
 *
 * Uses passed in templates for file and directory exports
 * but then also adds any SFC files because this format is
 * unrelated to the chosen export type.
 */
function exportTemplate(exportable, opts = {}, callbacks) {
    const contentLines = [];
    if (exportable.files.length > 0) {
        contentLines.push(`\n// local file exports`);
        if (callbacks.file) {
            exportable.files.forEach((file) => {
                contentLines.push(callbacks.file(file));
            });
        }
        else {
            contentLines.push(`// the export strategy chosen does not write file exports`);
        }
    }
    // if the command line switch for Vue SFC's is turned on
    if (opts.sfc && exportable.sfcs.length > 0) {
        contentLines.push(`\n// SFC components`);
        exportable.sfcs.forEach((sfc) => contentLines.push(`export { default as ${index_1.removeExtension(sfc)} } from "./${sfc}";`));
    }
    if (exportable.dirs.length > 0) {
        contentLines.push(`\n// directory exports`);
    }
    if (callbacks.dir) {
        exportable.dirs.forEach((dir) => {
            contentLines.push(callbacks.dir(dir));
        });
    }
    else {
        contentLines.push(`// the export strategy chosen does not write directories to this file`);
    }
    if (exportable.orphans.length > 0) {
        contentLines.push(`\n// there were directories orphaned: ${exportable.orphans.join(", ")}`);
    }
    return contentLines.join("\n");
}
exports.exportTemplate = exportTemplate;
