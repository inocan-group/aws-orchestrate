"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwsProfile = void 0;
const index_1 = require("./index");
const index_2 = require("../errors/index");
/**
 * Get a specific _named profile_ in the AWS `credentials` file;
 * throws `devops/not-ready` if error.
 */
async function getAwsProfile(profileName) {
    const profile = await index_1.getAwsProfileList();
    if (!profile) {
        throw new index_2.DevopsError(`Attempt to get the AWS profile "${profileName}" failed because the AWS credentials file does not exist!`, "devops/not-ready");
    }
    if (!profile[profileName]) {
        throw new index_2.DevopsError(`The AWS profile "${profileName}" does not exist in the AWS credentials file! Valid profile names are: ${Object.keys(profile).join(", ")}`, "devops/not-ready");
    }
    return profile[profileName];
}
exports.getAwsProfile = getAwsProfile;
