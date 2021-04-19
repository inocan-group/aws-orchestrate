"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipWebpackFiles = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = require("path");
require("../../../@polyfills/bestzip");
const zip = require("bestzip");
/**
 * Zips up a number of
 *
 * @param fns a list of functions to zip
 */
async function zipWebpackFiles(fns) {
    const promises = [];
    try {
        const fnWithPath = (f) => path_1.join(".webpack", f);
        fns.forEach((fn) => promises.push(zip({
            source: `./${fnWithPath(fn)}.js`,
            destination: `./${fnWithPath(fn)}.zip`,
        }).catch((e) => {
            throw e;
        })));
        return Promise.all(promises);
    }
    catch (e) {
        console.log(chalk_1.default `{red - Problem zipping webpack files! ${"\uD83D\uDE21" /* angry */}}`);
        console.log(`- ${e.message}`);
        console.log(chalk_1.default `{grey \n${e.stack}}\n`);
        process.exit();
    }
}
exports.zipWebpackFiles = zipWebpackFiles;
