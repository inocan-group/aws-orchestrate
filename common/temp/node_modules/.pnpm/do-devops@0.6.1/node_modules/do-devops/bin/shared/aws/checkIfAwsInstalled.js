"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfAwsInstalled = void 0;
const async_shelljs_1 = require("async-shelljs");
/**
 * Tests whether the executing environment has the **AWS CLI**
 * available.
 */
async function checkIfAwsInstalled() {
    try {
        const test = async_shelljs_1.asyncExec(`aws`, { silent: true });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.checkIfAwsInstalled = checkIfAwsInstalled;
