"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineProfile = void 0;
const index_1 = require("../index");
const lodash_1 = require("lodash");
/** ensure that during one CLI operation we cache this value */
let profile;
/**
 * Based on CLI, serverless info, and config files, determine which
 * AWS `profile` the serverless command should leverage for credentials
 * as well as -- optionally -- the _region_. Sequence is:
 *
 * - look at `CLI switches` for explicit statement about profile
 * - if serverlessYaml, use serverless config to determine
 * - look at the global default for the `project configuration`
 * - look at the global default for the `user configuration`
 * - if "interactive", then ask user for profile name from available options
 */
async function determineProfile(opts) {
    if (lodash_1.get(opts, "cliOptions.profile", undefined)) {
        return opts.cliOptions.profile;
    }
    let serverlessYaml;
    try {
        serverlessYaml = await index_1.getServerlessYaml();
        if (lodash_1.get(serverlessYaml, "provider.profile", undefined)) {
            profile = serverlessYaml.provider.profile;
            return profile;
        }
    }
    catch (e) {
        // nothing to do
    }
    let doConfig;
    try {
        doConfig = await index_1.getConfig("both");
        if (doConfig && doConfig.global.defaultAwsProfile) {
            profile = doConfig.global.defaultAwsProfile;
        }
    }
    catch (e) { }
    if (!profile && opts.interactive) {
        try {
            profile = await index_1.askForAwsProfile({ exitOnError: false });
            const saveForNextTime = await index_1.askToSaveConfig("global.defaultAwsProfile", profile);
        }
        catch (e) { }
    }
    if (!profile) {
        throw new index_1.DevopsError(`Could not determine the AWS profile! [ ${JSON.stringify(opts)}]`, "devops/not-ready");
    }
    return profile;
}
exports.determineProfile = determineProfile;
