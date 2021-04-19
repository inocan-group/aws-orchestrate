"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageInfo = void 0;
const async_shelljs_1 = require("async-shelljs");
const errors_1 = require("../errors");
/**
 * Calls on the network to get `yarn info [xxx]`;
 * if the package name is excluded then it just
 * looks for the local package and throws an error
 * if not found
 */
async function getPackageInfo(pkg = "") {
    let npm;
    try {
        npm = JSON.parse(await async_shelljs_1.asyncExec("yarn info --json", { silent: true }))
            .data;
        return npm;
    }
    catch (e) {
        // appears NOT to be a NPM package
        throw new errors_1.DevopsError(pkg
            ? `The package ${pkg} does not exist in NPM.`
            : `The local package does not exist in NPM.`, `devops/does-not-exist`);
    }
}
exports.getPackageInfo = getPackageInfo;
