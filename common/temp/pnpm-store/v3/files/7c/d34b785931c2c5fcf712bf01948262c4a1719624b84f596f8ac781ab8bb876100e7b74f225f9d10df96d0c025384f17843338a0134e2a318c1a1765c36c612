"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwsUserProfile = void 0;
const aws_sdk_1 = require("aws-sdk");
const getAwsProfile_1 = require("./getAwsProfile");
/**
 * Uses the AWS SDK to get the user's profile information.
 *
 * @param awsProfile you may pass in the _string_ name of the profile or the profile itself
 */
async function getAwsUserProfile(awsProfile) {
    if (typeof awsProfile === "string") {
        awsProfile = await getAwsProfile_1.getAwsProfile(awsProfile);
    }
    const up = new aws_sdk_1.IAM({
        accessKeyId: awsProfile.aws_access_key_id,
        secretAccessKey: awsProfile.aws_secret_access_key
    })
        .getUser()
        .promise();
    return up;
}
exports.getAwsUserProfile = getAwsUserProfile;
