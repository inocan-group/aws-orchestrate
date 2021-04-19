"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHasAwsProfile = void 0;
const index_1 = require("./index");
/**
 * Indicates whether the given user has the _credentials_ for a given
 * AWS profile.
 */
async function userHasAwsProfile(profileName) {
    const profiles = Object.keys(await index_1.getAwsProfileList());
    return profiles.includes(profileName);
}
exports.userHasAwsProfile = userHasAwsProfile;
