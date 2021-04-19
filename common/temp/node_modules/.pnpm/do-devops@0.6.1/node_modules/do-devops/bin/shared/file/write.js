"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.write = void 0;
const fs_1 = require("fs");
const util_1 = require("util");
const errors_1 = require("../errors");
const path_1 = require("path");
const filesExist_1 = require("./filesExist");
const w = util_1.promisify(fs_1.writeFile);
/**
 * **write**
 *
 * Writes a file to the filesystem; favoring files which are based off the repo's
 * root
 *
 * @param filename the filename to be written; if filename doesn't start with either a '.' or '/' then it will be joined with the projects current working directory
 * @param data the data to be written
 */
async function write(filename, data, options = {}) {
    try {
        if (typeof data !== "string") {
            data =
                options.spacing && options.spacing > 0
                    ? JSON.stringify(data, null, options.spacing)
                    : JSON.stringify(data);
        }
        if (![".", "/"].includes(filename.slice(0, 1))) {
            filename = path_1.join(process.cwd(), filename);
        }
        let offset;
        while (options.offsetIfExists && filesExist_1.filesExist(filename)) {
            const before = new RegExp(`-${offset}.(.*)$`);
            filename = offset ? filename.replace(before, ".$1") : filename;
            offset = !offset ? 1 : offset++;
            const after = new RegExp(`-${offset}$`);
            const parts = filename.split(".");
            filename =
                parts.slice(0, parts.length - 1).join(".") +
                    `-${offset}.` +
                    parts.slice(-1);
        }
        await w(filename, data, {
            encoding: "utf-8"
        });
        return { filename, data };
    }
    catch (e) {
        throw new errors_1.DevopsError(`Problem writing file "${filename}": ${e.message}`, "do-devops/can-not-write");
    }
}
exports.write = write;
