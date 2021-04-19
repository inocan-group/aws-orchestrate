"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDefaultConfig = exports.writeSection = void 0;
const getDefaultConfig_1 = require("./getDefaultConfig");
const index_1 = require("./index");
/**
 * Writes a sub-command's _section_ of the configuration.
 *
 * @param section The section to be updated
 * @param content The content to update with; if blank the default will be used
 * @param projectOrUserConfig States whether **user** or **project** config;
 * default is **project**
 */
async function writeSection(section, content, projectOrUserConfig) {
    projectOrUserConfig = projectOrUserConfig ? projectOrUserConfig : "project";
    const sectionMeta = content ? content : getDefaultConfig_1.getDefaultConfig(section);
    const currentConfig = await index_1.getConfig(projectOrUserConfig);
    // TODO: this should not be needed
    delete currentConfig.default;
    const output = { ...currentConfig, [section]: sectionMeta };
    index_1.writeConfig(output, projectOrUserConfig);
}
exports.writeSection = writeSection;
/**
 * Writes a `do.config.js` file using the default properties
 * setup in this repo.
 */
function writeDefaultConfig() {
    index_1.writeConfig(getDefaultConfig_1.getFullDefaultConfig());
}
exports.writeDefaultConfig = writeDefaultConfig;
