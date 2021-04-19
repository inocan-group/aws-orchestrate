"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalServerlessFunctionsFromServerlessYaml = void 0;
const index_1 = require("./index");
/**
 * Gets the list of functions defined in the `serverless.yml`
 * file.
 */
async function getLocalServerlessFunctionsFromServerlessYaml() {
    return index_1.serverlessYamlExists() ? (await index_1.getServerlessYaml()).functions : {};
}
exports.getLocalServerlessFunctionsFromServerlessYaml = getLocalServerlessFunctionsFromServerlessYaml;
