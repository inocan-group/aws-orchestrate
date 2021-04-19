"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportable = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const util_1 = require("./util");
const globby = require("globby");
/**
 * Determines the _files_, _directories_, and _sfc_'s in a _given directory_ that should be included
 * in the index file. Files which match the
 */
async function exportable(filePath, excluded) {
    const dir = path_1.posix.dirname(filePath);
    const thisFile = path_1.posix.basename(filePath);
    const exclusions = excluded.concat(thisFile);
    const files = (await globby([`${dir}/*.ts`, `${dir}/*.js`]))
        .filter((file) => !exclusions.includes(util_1.removeExtension(path_1.basename(file))))
        .map((i) => path_1.basename(i));
    const sfcs = (await globby([`${dir}/*.vue`]))
        .filter((file) => !exclusions.includes(util_1.removeExtension(path_1.basename(file))))
        .map((i) => path_1.basename(i));
    const dirs = [];
    const orphans = [];
    fs_1.readdirSync(dir, { withFileTypes: true })
        .filter((i) => i.isDirectory())
        .filter((i) => !exclusions.includes(util_1.removeExtension(i.name)))
        .map((i) => {
        // directories must have a `index` file within them to considered
        // as a directory export
        const ts = path_1.posix.join(dir, i.name, "index.ts");
        const js = path_1.posix.join(dir, i.name, "index.js");
        if (fs_1.existsSync(ts)) {
            if (!util_1.isOrphanedIndexFile(ts)) {
                dirs.push(i.name);
            }
            else {
                orphans.push(i.name);
            }
        }
        else if (fs_1.existsSync(js)) {
            if (!util_1.isOrphanedIndexFile(js)) {
                dirs.push(i.name);
            }
            else {
                orphans.push(i.name);
            }
        }
    });
    return { files, base: dir, dirs, sfcs, orphans };
}
exports.exportable = exportable;
