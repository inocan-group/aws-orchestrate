"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerlessBuildConfiguration = void 0;
const shared_1 = require("../../shared");
const typed_mapper_1 = require("typed-mapper");
/**
 * Will find the appropriate configuration information
 * for the serverless build process. Looking either in
 * the `serverless-config/account-info.yml` (deprecated)
 * or pulled from the Yeoman templates's `.yo-rc.json` file.
 *
 * If the info is not found in either location then it
 * will switch to interactive mode to get the data it
 * needs.
 */
async function getServerlessBuildConfiguration() {
    const modern = shared_1.getYeomanScaffolds().includes("generator-lambda-typescript");
    const knownAccountInfo = {
        ...(modern
            ? transformYeomanFormat(await shared_1.getYeomanConfig())
            : await shared_1.getAccountInfoFromServerlessYaml()),
        devDependencies: Object.keys(shared_1.getPackageJson().devDependencies),
        pluginsInstalled: Object.keys(shared_1.getPackageJson().devDependencies).filter((i) => i.startsWith("serverless-")),
    };
    const accountInfo = await shared_1.askForAccountInfo(knownAccountInfo);
    return accountInfo;
}
exports.getServerlessBuildConfiguration = getServerlessBuildConfiguration;
function transformYeomanFormat(input) {
    return typed_mapper_1.TypedMapper.map({
        name: "serviceName",
        accountId: "awsAccount",
        profile: "awsProfile",
        region: "awsRegion",
        devDependencies: () => [],
        pluginsInstalled: () => [],
    }).convertObject(input);
}
