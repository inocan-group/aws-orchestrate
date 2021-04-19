"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeConfig = void 0;
const fs_1 = require("fs");
const shared_1 = require("../../shared");
/**
 * **writeConfig**
 *
 * Writes the `do-devops` config file to either the **project**'s root
 * or User's **home directory**.
 */
function writeConfig(content, projectOrUserConfig = "project") {
    const filename = shared_1.getConfigFilename(projectOrUserConfig);
    fs_1.writeFileSync(filename, "const config = " + JSON.stringify(content, null, 2) + ";\nmodule.exports = config;", {
        encoding: "utf-8",
    });
}
exports.writeConfig = writeConfig;
