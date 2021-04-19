"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchHandler = void 0;
const chalk = require("chalk");
const path_1 = require("path");
const processFiles_1 = require("./processFiles");
const shared_1 = require("../../../shared");
const util_1 = require("./util");
/** to avoid circular events, we need to allow certain files to be ignored */
let filesToIgnore = [];
/**
 * configures a watch handler for an `autoindex` watched directory
 */
function watchHandler(dir, options = {}) {
    const log = console.log.bind(console);
    return (evtBeingWatched) => {
        return (filepath, stats) => {
            if (filesToIgnore.includes(filepath)) {
                // autoindex file has been changed due to the autoindex processing
                filesToIgnore = filesToIgnore.filter((i) => i !== filepath);
                return;
            }
            /** files in event directory which are autoindex files */
            let indexFiles;
            const fileIsIndexFile = (fp) => /(index|private).[tj]s/.test(fp);
            if (fileIsIndexFile(filepath)) {
                filesToIgnore.push(filepath);
                indexFiles = [filepath];
            }
            else {
                indexFiles = shared_1.directoryFiles(dir)
                    .map((i) => path_1.posix.join(dir, i.file))
                    .filter((f) => util_1.isAutoindexFile(f));
                indexFiles.forEach((i) => filesToIgnore.push(i));
            }
            const isMonoRepo = filepath.includes("packages/");
            const pkg = isMonoRepo ? Array.from(/.*packages\/(\S+?\/)/.exec(filepath))[1] : "";
            const verbLookup = {
                changed: "changed",
                added: "added",
                removed: "removed",
            };
            const verb = Object.keys(verbLookup).includes(evtBeingWatched)
                ? verbLookup[evtBeingWatched]
                : "unknown";
            const message = isMonoRepo
                ? chalk `- the file ${shared_1.highlightFilepath(filepath)} in package {italic ${pkg}} was {italic ${evtBeingWatched}} to a watched directory`
                : chalk `- the file ${shared_1.highlightFilepath(filepath)} was {italic ${evtBeingWatched}} to a watched directory`;
            if (!fileIsIndexFile(filepath)) {
                log(message);
            }
            else {
                if (evtBeingWatched === "unlinked") {
                    indexFiles = [];
                }
            }
            if (indexFiles.length > 0) {
                processFiles_1.processFiles(indexFiles, { ...options, quiet: true }).then(() => log());
            }
        };
    };
}
exports.watchHandler = watchHandler;
