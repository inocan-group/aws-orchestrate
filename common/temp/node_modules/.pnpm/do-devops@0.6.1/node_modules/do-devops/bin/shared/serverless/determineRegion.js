"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineRegion = void 0;
const chalk_1 = __importDefault(require("chalk"));
const determineProfile_1 = require("./determineProfile");
const lodash_1 = require("lodash");
const aws_1 = require("../aws");
const index_1 = require("../index");
const getServerlessYaml_1 = require("./getServerlessYaml");
/**
 * Determines the appropriate `region` to point at based on CLI switches/options,
 * the Serverless configuration, and the global `do` config defaults.
 */
async function determineRegion(opts) {
    const config = await index_1.getConfig();
    const cliRegion = lodash_1.get(opts, "cliOptions.region");
    let outcome = cliRegion || process.env.AWS_REGION;
    if (!outcome) {
        try {
            outcome = lodash_1.get(await getServerlessYaml_1.getServerlessYaml(), "provider.region", undefined);
        }
        catch (e) { }
    }
    if (!outcome) {
        outcome = lodash_1.get(config, "global.defaultAwsRegion", undefined);
    }
    if (!outcome) {
        try {
            const profileName = await determineProfile_1.determineProfile(opts);
            const profile = await aws_1.getAwsProfile(profileName);
            if (profile && profile.region) {
                outcome = profile.region;
            }
        }
        catch (e) { }
    }
    // USER Config is last resort
    if (!outcome) {
        const userConfig = await index_1.getConfig("user");
        if (userConfig && userConfig.global.defaultAwsRegion) {
            if (opts.cliOptions && !opts.cliOptions.quiet) {
                console.log(chalk_1.default `{bold - AWS region has been resolved using the User's config ${"\uD83D\uDC40" /* eyeballs */}}. This is the source of "last resort" but may be intended.`);
            }
            outcome = userConfig.global.defaultAwsRegion;
        }
    }
    return outcome;
}
exports.determineRegion = determineRegion;
