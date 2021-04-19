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
exports.getConfig = void 0;
const index_1 = require("./index");
const fs_1 = require("fs");
const errors_1 = require("../errors");
const cache = {
    user: undefined,
    project: undefined,
};
/**
 * **getConfig**
 *
 * Gets the current configuration based on the `do.config.js` file.
 *
 * By default the configuration that will be loaded is the project's
 * configuration but you can state to instead use the `user` config
 * or `both`. In the case of `both`, the two config's will be merged
 * and the project config will take precedence.
 */
async function getConfig(userOrProject = "both") {
    let config;
    const userFilename = index_1.getConfigFilename("user");
    const projectFilename = index_1.getConfigFilename("project");
    const userConfig = fs_1.existsSync(userFilename) ? (await Promise.resolve().then(() => __importStar(require(userFilename)))).config : {};
    const projectConfig = fs_1.existsSync(projectFilename) ? await Promise.resolve().then(() => __importStar(require(projectFilename))) : {};
    if (!projectConfig && userOrProject === "project") {
        throw new errors_1.DevopsError(`Project configuration [${projectFilename}] for do-devops not found!`, "no-config");
    }
    if (!userConfig && userOrProject === "user") {
        throw new errors_1.DevopsError("User configuration for do-devops not found!", "no-config");
    }
    if (!userConfig && !projectConfig && userOrProject === "both") {
        throw new errors_1.DevopsError("Neither user nor project configuration for do-devops was found!", "no-config");
    }
    switch (userOrProject) {
        case "both":
            return { ...(userConfig ? userConfig : {}), ...(projectConfig ? projectConfig : {}) };
        case "project":
            return projectConfig;
        case "user":
            return userConfig;
        default:
            throw new errors_1.DevopsError(`Unknown configuration type "${userOrProject}" passed in!`, "invalid-config-type");
    }
}
exports.getConfig = getConfig;
