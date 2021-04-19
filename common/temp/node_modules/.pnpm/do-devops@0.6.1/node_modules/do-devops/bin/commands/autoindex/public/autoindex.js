"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const chalk_1 = __importDefault(require("chalk"));
const globby_1 = __importDefault(require("globby"));
const index_1 = require("../private/index");
const shared_1 = require("../../../shared");
const chokidar_1 = require("chokidar");
const path_1 = require("path");
const STANDARD_REPO = "ROOT";
/**
 * Finds all `index.ts` and `index.js` files and looks for the `#autoindex`
 * signature. If found then it _rebuilds_ thes file based on files in
 * the file's current directory
 */
async function handler(argv, opts) {
    const monoRepoPackages = shared_1.getMonoRepoPackages(process.cwd());
    if (monoRepoPackages && !opts.quiet) {
        console.log(chalk_1.default `{grey - monorepo detected with {yellow ${String(monoRepoPackages.length)}} packages}`);
    }
    const repoGlob = process.cwd();
    const candidateFiles = await globby_1.default(["**/index.ts", "**/index.js", "!**/node_modules"]);
    /** those files known to be autoindex files */
    let autoIndexFiles = candidateFiles.filter((fc) => index_1.isAutoindexFile(fc));
    if (!opts.quiet) {
        if (candidateFiles.length === autoIndexFiles.length) {
            console.log(chalk_1.default `- found {yellow ${String(candidateFiles.length)}} index files, all of which are setup to be autoindexed.\n`);
        }
        else {
            console.log(chalk_1.default `- found {yellow ${String(candidateFiles.length)}} {italic candidate} files, of which {yellow ${String(autoIndexFiles.length)}} have been setup to be autoindexed.\n`);
        }
    }
    await index_1.processFiles(autoIndexFiles, opts);
    if (opts.watch) {
        /**
         * A dictionary of all active watched directories. Keys are the directory path,
         * values are the watcher object.
         */
        let watchedDirs = {};
        setupAutoIndexWatcher(watchedDirs, opts);
        autoIndexFiles
            .map((i) => path_1.posix.dirname(i))
            .forEach((d) => (watchedDirs[d] = setupWatcherDir(d, [], opts)));
        console.log(chalk_1.default `- watching {yellow {bold ${String(autoIndexFiles.length)}}} directories for autoindex changes`);
    }
}
exports.handler = handler;
/**
 * Watches for changes in any file where an autoindex file resides
 */
function setupWatcherDir(dir, ignored = [], opts) {
    const EVENTS = ["add", "change", "unlink", "link"];
    const h = index_1.watchHandler(dir, opts);
    const allEvents = true;
    const watcher = chokidar_1.watch(dir, {
        ignored,
        persistent: true,
        usePolling: true,
        interval: 100,
    });
    watcher.on("ready", () => {
        watcher.on("error", (e) => {
            console.log(chalk_1.default `{red Error occurred watching "${dir}":} ${e.message}\n`);
        });
        EVENTS.forEach((evt) => {
            watcher.on(evt, h((evt.includes("Dir") ? `${evt}ed directory` : `${evt}ed`).replace("ee", "e")));
        });
    });
    return watcher;
}
/**
 * Watch for changes to autoindex files and add/remove file watchers in response
 */
function setupAutoIndexWatcher(watched, opts) {
    const log = console.log.bind(console);
    const watcher = chokidar_1.watch("**/index.[jt]s", {
        ignored: "node_modules/*",
        persistent: true,
        usePolling: true,
        interval: 100,
    });
    watcher.on("error", (e) => {
        log(chalk_1.default `{red Error occurred watching for changes to autoindex files:} ${e.message}\n`);
    });
    watcher.on("ready", () => {
        const handlerForAutoIndexFiles = (evt) => {
            return (path, stats) => {
                if (!/(index|private)\.[tj]s/.test(path))
                    return;
                const watchedDirs = Object.keys(watched);
                const dir = path_1.posix.dirname(path);
                switch (evt) {
                    case "change":
                        if (watchedDirs.includes(dir) && !index_1.isAutoindexFile(path)) {
                            log(chalk_1.default `- index file ${shared_1.highlightFilepath(path)} is no longer an {italic autoindex} file`);
                            if (watched[path]) {
                                watched[path].close();
                                watched[path] = undefined;
                            }
                            else {
                                log(chalk_1.default `- {red Warn:} an autoindex file was converted to a non autoindexed file but when trying remove the watcher on that directory it appears it doesn't exist. This should not happen.`);
                            }
                        }
                    case "add":
                    case "link":
                        if (!watchedDirs.includes(dir) && index_1.isAutoindexFile(path)) {
                            log(`- new autoindex file detected: ${shared_1.highlightFilepath(path)}; watcher started`);
                            watched[path] = setupWatcherDir(dir, [], opts);
                            index_1.processFiles([path], opts);
                        }
                        break;
                    case "unlink":
                        log({ dir, path, watched: Object.keys(watched) });
                        if (watchedDirs.includes(dir)) {
                            log(`- the autoindex file ${shared_1.highlightFilepath(path)} has been removed`);
                            if (watched[dir]) {
                                watched[dir].close();
                                watched[dir] = undefined;
                            }
                            else {
                                log(chalk_1.default `- {red Warn:} an autoindex file was removed but there was no existing watcher on that directory.`);
                            }
                        }
                }
            };
        };
        ["add", "change", "unlink", "link"].forEach((evt) => {
            watcher.on(evt, handlerForAutoIndexFiles(evt));
        });
        log(chalk_1.default `{grey - watcher events for autoindex discovery in place}`);
    });
    return watcher;
}
