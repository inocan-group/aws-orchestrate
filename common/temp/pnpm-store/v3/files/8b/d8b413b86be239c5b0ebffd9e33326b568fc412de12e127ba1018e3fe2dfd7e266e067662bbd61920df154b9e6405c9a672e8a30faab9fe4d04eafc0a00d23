"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToolToRepoConfig = void 0;
const index_1 = require("../../shared/index");
/**
 * Saves a given _build tool_ as the default for the current
 * repo.
 */
async function saveToolToRepoConfig(tool) {
    const { build } = await index_1.getConfig();
    if (build.buildTool !== tool) {
        build.buildTool = tool;
        await index_1.writeSection("build", build);
    }
}
exports.saveToolToRepoConfig = saveToolToRepoConfig;
