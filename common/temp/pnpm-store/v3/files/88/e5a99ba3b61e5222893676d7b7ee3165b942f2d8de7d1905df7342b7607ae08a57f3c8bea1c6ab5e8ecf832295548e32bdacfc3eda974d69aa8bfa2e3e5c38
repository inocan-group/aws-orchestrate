"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingMetaInfo = void 0;
const alreadyHasAutoindexBlock_1 = require("./alreadyHasAutoindexBlock");
/**
 * Gets all meta information about the prior state of the file contents
 */
function getExistingMetaInfo(fileContent) {
    const hasExistingMeta = alreadyHasAutoindexBlock_1.alreadyHasAutoindexBlock(fileContent);
    const files = hasExistingMeta ? getFilesMeta(fileContent) : [];
    const dirs = hasExistingMeta ? getDirsMeta(fileContent) : [];
    const sfcs = hasExistingMeta ? getSFCsMeta(fileContent) : [];
    const exportType = hasExistingMeta ? getExportType(fileContent) : "";
    const exclusions = hasExistingMeta ? getExclusions(fileContent) : [];
    return { hasExistingMeta, files, dirs, sfcs, exportType, exclusions };
}
exports.getExistingMetaInfo = getExistingMetaInfo;
function getExportType(content) {
    const matches = content.match(/\/\/ export: (.*)\;/);
    return Array.isArray(matches) ? matches[1].trim() : "";
}
function getExclusions(content) {
    const matches = content.match(/\/\/ export: .*\; exclusions: (.*)\./);
    return Array.isArray(matches) ? matches[1].trim().split(", ") : [];
}
function getFilesMeta(content) {
    const matches = content.match(/\/\/ files: (.*)\./);
    return Array.isArray(matches) ? matches[1].trim().split(", ") : [];
}
function getDirsMeta(content) {
    const matches = content.match(/\/\/ directories: (.*)\./);
    return Array.isArray(matches) ? matches[1].trim().split(", ") : [];
}
function getSFCsMeta(content) {
    const matches = content.match(/\/\/ SFCs: (.*)\./);
    return Array.isArray(matches) ? matches[1].trim().split(", ") : [];
}
