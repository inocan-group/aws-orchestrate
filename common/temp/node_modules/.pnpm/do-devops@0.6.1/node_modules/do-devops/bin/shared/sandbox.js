"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sandbox = void 0;
const async_shelljs_1 = require("async-shelljs");
const index_1 = require("./git/index");
/**
 * Determines the `stage` to replace "dev" with a more
 * isolated sandboxing strategy; based on the user's
 * sandbox configuration
 */
async function sandbox(strategy) {
    switch (strategy) {
        case "user":
            const user = (await async_shelljs_1.asyncExec("git config user.name")).replace(/ /g, "").replace(/\-/g, "").toLowerCase();
            return user || "dev";
        case "branch":
            const branch = await index_1.getCurrentGitBranch();
            switch (branch) {
                case "develop":
                    return "dev";
                case "master":
                    throw new Error('You can not deploy stage "dev" to the master branch.');
                default:
                    const isFeatureBranch = branch.includes("feature");
                    return isFeatureBranch ? branch.replace(/.*\//, "").replace(/\-/g, "") : "dev";
            }
        default:
            return "dev";
    }
}
exports.sandbox = sandbox;
