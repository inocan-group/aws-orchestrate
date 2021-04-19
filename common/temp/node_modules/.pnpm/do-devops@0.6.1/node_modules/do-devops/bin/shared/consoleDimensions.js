"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleDimensions = void 0;
const async_shelljs_1 = require("async-shelljs");
/**
 * gets back the `height` and `width` of the current
 * console
 */
async function consoleDimensions() {
    let [width, height] = (await async_shelljs_1.asyncExec(`echo $(tput cols),$(tput lines)`, {
        silent: true
    }))
        .split(",")
        .map(i => Number(i));
    width = process.stdout.columns || width;
    height = process.stdout.rows || height;
    return { height, width };
}
exports.consoleDimensions = consoleDimensions;
