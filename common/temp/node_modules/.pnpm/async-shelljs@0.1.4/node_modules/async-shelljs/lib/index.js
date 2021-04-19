"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
var shelljs_2 = require("shelljs");
exports.cat = shelljs_2.cat;
exports.cd = shelljs_2.cd;
exports.chmod = shelljs_2.chmod;
exports.cp = shelljs_2.cp;
exports.pushd = shelljs_2.pushd;
exports.popd = shelljs_2.popd;
exports.dirs = shelljs_2.dirs;
exports.echo = shelljs_2.echo;
exports.exec = shelljs_2.exec;
exports.find = shelljs_2.find;
exports.grep = shelljs_2.grep;
exports.ln = shelljs_2.ln;
exports.ls = shelljs_2.ls;
exports.mkdir = shelljs_2.mkdir;
exports.mv = shelljs_2.mv;
exports.pwd = shelljs_2.pwd;
exports.rm = shelljs_2.rm;
exports.sed = shelljs_2.sed;
exports.set = shelljs_2.set;
exports.tempdir = shelljs_2.tempdir;
exports.test = shelljs_2.test;
exports.touch = shelljs_2.touch;
exports.which = shelljs_2.which;
exports.exit = shelljs_2.exit;
exports.error = shelljs_2.error;
exports.env = shelljs_2.env;
exports.config = shelljs_2.config;
exports.ShellString = shelljs_2.ShellString;
function asyncExec(command, options = {}) {
    return new Promise((resolve, reject) => {
        shelljs_1.exec(command, { ...options, async: false }, (code, stdout, stderr) => {
            if (code !== 0) {
                const e = new Error();
                e.message = stderr;
                e.name = String(code);
                reject(e);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
exports.asyncExec = asyncExec;
//# sourceMappingURL=index.js.map