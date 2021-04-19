"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const chalk = require("chalk");
const async_shelljs_1 = require("async-shelljs");
async function handler(action, currentBranch, options = {}) {
    console.log(chalk `- ${"\uD83D\uDC40" /* eyeballs */} ensuring Typescript compiler reports no errors in transpilation`);
    const result = async_shelljs_1.exec(`yarn tsc`, { silent: options.quiet });
    if (result.code === 0) {
        console.log(chalk `- ${"\uD83C\uDF89" /* party */} transpilation found no issues!`);
    }
    if (options.quiet && result.code !== 0) {
        console.log(chalk `- ${"\uD83D\uDCA9" /* poop */} transpilation failed!`);
    }
    // return real result code if error; otherwise just report a normal exit
    return action === "error" ? result.code : 0;
}
exports.handler = handler;
