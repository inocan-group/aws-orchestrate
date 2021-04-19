"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullDefaultConfig = exports.getDefaultConfig = void 0;
const config = __importStar(require("../../config/index"));
const index_1 = require("../index");
const defaultConfigSections_1 = require("../defaultConfigSections");
/**
 * **getDefaultConfig**
 *
 * If the `command` is not specified it returns the default config file
 * with **all** sections filled in. If you want only a only a single
 * section then you can name it (where "global" is what it says on
 * the tin).
 */
function getDefaultConfig(command) {
    if (!command) {
        const sections = defaultConfigSections_1.defaultConfigSections();
        let content;
        sections.forEach((section) => {
            const newContent = { [section]: getDefaultConfig(section) };
            content = { ...content, ...newContent };
        });
        return content;
    }
    if (!config[command]) {
        throw new index_1.DevopsError(`Attempt to get the defaults for the "${command}" command failed because there is no file defining it!`, "devops/not-ready");
    }
    if (typeof config[command] !== "function") {
        throw new index_1.DevopsError(`Attempt to get the defaults for the "${command}" command failed because while there IS a file defining it it does not have a default export which is a function!`, "devops/not-allowed");
    }
    return config[command]();
}
exports.getDefaultConfig = getDefaultConfig;
function getFullDefaultConfig() {
    return getDefaultConfig();
}
exports.getFullDefaultConfig = getFullDefaultConfig;
