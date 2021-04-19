"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const async_shelljs_1 = require("async-shelljs");
const chalk = require("chalk");
async function handler(action, currentBranch, options = {}) {
    const target = options.target || "do test";
    if (options.quiet)
        console.log(chalk `- ${"\uD83C\uDFC3" /* run */} running unit tests`);
    const result = async_shelljs_1.exec(`yarn ${target}`, { silent: options.quiet });
    if (options.quiet) {
        if (result.code === 0) {
            console.log(chalk `- ${"\uD83C\uDF89" /* party */} unit tests were successful!`);
        }
        else {
            console.log(chalk `- ${"\uD83D\uDCA9" /* poop */} unit tests failed!`);
        }
    }
    // return real result code if error; otherwise just report a normal exit
    return action === "error" ? result.code : 0;
}
exports.handler = handler;
