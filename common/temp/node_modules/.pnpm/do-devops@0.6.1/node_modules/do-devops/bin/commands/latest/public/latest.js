"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const git_1 = require("../../../shared/git/git");
const shared_1 = require("../../../shared");
const chalk = require("chalk");
async function handler(argv, opts) {
    const g = git_1.git();
    const latest = (await g.tags()).latest;
    const status = await g.status();
    const pkgVersion = shared_1.getPackageJson().version;
    const aheadBehind = status.ahead === 0 && status.behind === 0
        ? ``
        : `\n- Your local repo is ${status.ahead > 0 ? `ahead by ${status.ahead} commits` : `behind by ${status.behind} commits`}`;
    const changes = status.not_added.length === 0 && status.modified.length === 0
        ? ``
        : chalk `\n- Locally you have {yellow ${status.not_added.length > 0 ? status.not_added.length : "zero"}} {italic new} files and {yellow ${status.modified.length}} {italic modified} files`;
    const conflicts = status.conflicted.length === 0
        ? ``
        : chalk `- ${"\uD83D\uDCA9" /* poop */} There are {bold {red ${status.conflicted.length}}} conflicted files!`;
    if (opts.verbose) {
        console.log(chalk `The remote repo's latest version is {bold {yellow ${latest}}}; {blue package.json} is ${pkgVersion === latest ? `the same` : `is {bold ${pkgVersion}}`}.${aheadBehind}${changes}${conflicts}`);
        console.log("\n");
    }
    else {
        console.log(latest);
    }
    return latest;
}
exports.handler = handler;
