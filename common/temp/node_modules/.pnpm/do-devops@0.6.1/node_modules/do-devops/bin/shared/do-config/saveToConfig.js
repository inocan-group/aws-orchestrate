"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToConfig = void 0;
const set = require("lodash.set");
const shared_1 = require("../../shared");
const shared_2 = require("../../shared");
/**
 * saves a value to the configuration file
 *
 * @param path the path in the config to write to
 * @param value the value to set
 * @param projectOrUser 'project' or 'user'
 */
async function saveToConfig(path, value, projectOrUser) {
    const filename = shared_1.getConfigFilename(projectOrUser);
    const config = set(await shared_1.getConfig(projectOrUser), path, value);
    console.log({ config });
    shared_2.writeConfig(config, projectOrUser);
}
exports.saveToConfig = saveToConfig;
