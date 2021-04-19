"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directoryFiles = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const errors_1 = require("../errors");
/**
 * Given a passed in _directory_, this function returns the files in that directory
 * as well as their "stats".
 *
 * Note: _relative_ paths to the current working directory are assumed but you can
 * lead with the `/` character to indicate a full directory path
 */
function directoryFiles(dir) {
    try {
        const fullDir = ["/", "\\"].includes(dir.slice(0, 1)) ? dir : path_1.posix.join(process.cwd(), dir);
        const files = fs_1.readdirSync(fullDir);
        return files.reduce((agg, file) => {
            const stats = fs_1.statSync(path_1.posix.join(process.cwd(), dir, file));
            return agg.concat({ file, stats });
        }, []);
    }
    catch (e) {
        throw new errors_1.DevopsError(`Attempt to get files from the directory "${dir}" [ ${path_1.posix.join(process.cwd(), dir)} ] failed: ${e.message}`, "do-devops/directoryFiles");
    }
}
exports.directoryFiles = directoryFiles;
