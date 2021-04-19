"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFiles = void 0;
const shared_1 = require("../../../shared");
const index_1 = require("./index");
const fs_1 = require("fs");
const reference_1 = require("./reference");
const chalk = require("chalk");
const util_1 = require("./util");
const ui_1 = require("../../../shared/ui");
/**
 * Reach into each file and look to see if it is a "autoindex" file; if it is
 * then create the autoindex.
 */
async function processFiles(paths, opts) {
    const results = {};
    const defaultExclusions = ["index", "private"];
    const baseExclusions = opts.add
        ? defaultExclusions.concat(opts.add.split(",").map((i) => i.trim()))
        : defaultExclusions;
    for await (const path of paths) {
        const fileString = fs_1.readFileSync(path, { encoding: "utf-8" });
        const isAutoIndex = /^\/\/\s*#autoindex/;
        if (isAutoIndex.test(fileString)) {
            results[path] = fileString;
        }
    }
    if (Object.keys(results).length === 0) {
        if (opts.withinMonorepo) {
            console.log(chalk `- No {italic autoindex} files found in this monorepo`);
            return;
        }
        else {
            index_1.communicateApi(paths);
        }
    }
    else {
        // iterate over each autoindex file
        for (const filePath of Object.keys(results)) {
            let fileContent = results[filePath];
            const excluded = index_1.exclusions(fileContent).concat(baseExclusions);
            const exportableSymbols = await index_1.exportable(filePath, excluded);
            const exportType = index_1.detectExportType(fileContent);
            let autoIndexContent;
            switch (exportType) {
                case reference_1.ExportType.default:
                    autoIndexContent = index_1.defaultExports(exportableSymbols, opts);
                    break;
                case reference_1.ExportType.namedOffset:
                    autoIndexContent = index_1.namedOffsetExports(exportableSymbols, opts);
                    break;
                case reference_1.ExportType.named:
                    autoIndexContent = index_1.namedExports(exportableSymbols, opts);
                    break;
                default:
                    throw new shared_1.DevopsError(`Unknown export type: ${exportType}!`, "invalid-export-type");
            }
            /** content that defines the full region owned by autoindex */
            const blockContent = `${index_1.START_REGION}\n\n${index_1.timestamp()}\n${index_1.createMetaInfo(exportType, exportableSymbols, index_1.exclusions(fileContent), opts)}\n${autoIndexContent}\n\n${reference_1.AUTOINDEX_INFO_MSG}\n\n${index_1.END_REGION}`;
            const existingContentMeta = index_1.getExistingMetaInfo(fileContent);
            let exportAction;
            const bracketedMessages = [];
            if (exportType !== reference_1.ExportType.named) {
                bracketedMessages.push(chalk `{grey using }{italic ${exportType}} {grey export}`);
            }
            const hasOldStyleBlock = /\/\/#region.*\/\/#endregion/s.test(fileContent);
            if (autoIndexContent && index_1.alreadyHasAutoindexBlock(fileContent)) {
                if (index_1.noDifference(existingContentMeta.files, util_1.removeAllExtensions(exportableSymbols.files)) &&
                    index_1.noDifference(existingContentMeta.dirs, util_1.removeAllExtensions(exportableSymbols.dirs)) &&
                    index_1.noDifference(existingContentMeta.sfcs, util_1.removeAllExtensions(exportableSymbols.sfcs)) &&
                    exportType === existingContentMeta.exportType &&
                    index_1.noDifference(existingContentMeta.exclusions, excluded)) {
                    exportAction = hasOldStyleBlock ? index_1.ExportAction.refactor : index_1.ExportAction.noChange;
                }
                else {
                    exportAction = index_1.ExportAction.updated;
                }
            }
            else if (autoIndexContent) {
                exportAction = index_1.ExportAction.added;
            }
            // BUILD UP CLI MESSAGE
            const warnings = index_1.unexpectedContent(index_1.nonBlockContent(fileContent));
            if (warnings) {
                bracketedMessages.push(chalk ` {red unexpected content: {italic {dim ${Object.keys(warnings).join(", ")} }}}`);
            }
            const excludedWithoutBase = excluded.filter((i) => !baseExclusions.includes(i));
            if (excludedWithoutBase.length > 0) {
                bracketedMessages.push(chalk `{italic excluding:} {grey ${excludedWithoutBase.join(", ")}}`);
            }
            const bracketedMessage = bracketedMessages.length > 0 ? chalk `{dim [ ${bracketedMessages.join(", ")} ]}` : "";
            const changeMessage = chalk `- ${exportAction === index_1.ExportAction.added ? "added" : "updated"} ${ui_1.highlightFilepath(filePath)} ${bracketedMessage}`;
            const refactorMessage = chalk `- removing an old form of autoindex block style at ${ui_1.highlightFilepath(filePath)}`;
            const unchangedMessage = chalk `{dim - {italic no changes} to ${ui_1.highlightFilepath(filePath)}} ${bracketedMessage}`;
            if (!opts.quiet && exportAction === index_1.ExportAction.noChange) {
                console.log(unchangedMessage);
            }
            else if (exportAction === index_1.ExportAction.refactor) {
                console.log(refactorMessage);
                fs_1.writeFileSync(filePath, util_1.cleanOldBlockFormat(existingContentMeta.hasExistingMeta
                    ? index_1.replaceRegion(fileContent, blockContent)
                    : fileContent.concat("\n" + blockContent) + "\n"));
            }
            else {
                console.log(changeMessage);
                fs_1.writeFileSync(filePath, util_1.cleanOldBlockFormat(existingContentMeta.hasExistingMeta
                    ? index_1.replaceRegion(fileContent, blockContent)
                    : fileContent.concat("\n" + blockContent) + "\n"));
            }
        }
    }
    if (!opts.quiet) {
        console.log();
    }
}
exports.processFiles = processFiles;
