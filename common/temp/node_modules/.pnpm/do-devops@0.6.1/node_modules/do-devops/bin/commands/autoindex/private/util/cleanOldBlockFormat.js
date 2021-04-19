"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanOldBlockFormat = void 0;
/**
 * The _old_ block was structured as `//#region` but this is not considered good
 * form by many linters so we've moved to `// #region` instead. This makes sure
 * the old block style has been removed.
 */
function cleanOldBlockFormat(fileContents) {
    return fileContents.replace(/\/\/#region.*\/\/#endregion/s, "");
}
exports.cleanOldBlockFormat = cleanOldBlockFormat;
