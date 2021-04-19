"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiGatewayEndpoints = void 0;
const aws_sdk_1 = require("aws-sdk");
const index_1 = require("./index");
const userHasAwsProfile_1 = require("./userHasAwsProfile");
const chalk = require("chalk");
/**
 * Gets all API Gatway _endpoints_ defined in a given
 * AWS profile/account.
 */
async function getApiGatewayEndpoints(profileName, region) {
    if (!userHasAwsProfile_1.userHasAwsProfile(profileName)) {
        console.log(chalk `- attempt to get {italics endpoints} not possible with the profile {blue ${profileName}} as you do not have credentials defined for this profile! ${"\uD83D\uDE21" /* angry */}\n`);
        process.exit();
    }
    const profile = await index_1.getAwsProfile(profileName);
    const credential = index_1.convertProfileToApiCredential(profile);
    const gw = new aws_sdk_1.APIGateway({
        ...credential,
        region,
    });
    const apis = await gw.getRestApis().promise();
    console.log(JSON.stringify(apis, null, 2));
    const detail = await gw.getRestApi({ restApiId: apis.items[0].apiKeySource });
    return detail;
}
exports.getApiGatewayEndpoints = getApiGatewayEndpoints;
