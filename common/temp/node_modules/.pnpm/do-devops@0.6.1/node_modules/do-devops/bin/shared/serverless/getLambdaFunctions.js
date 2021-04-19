"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLambdaFunctions = void 0;
const aws_sdk_1 = require("aws-sdk");
const determineRegion_1 = require("./determineRegion");
const aws_1 = require("../aws");
const determineProfile_1 = require("./determineProfile");
/**
 * Uses the AWS Lambda API to retrieve a list of functions for given
 * profile/region.
 */
async function getLambdaFunctions(opts = {}) {
    const region = await determineRegion_1.determineRegion({ cliOptions: opts });
    const profileName = await determineProfile_1.determineProfile({ cliOptions: opts });
    const profile = aws_1.convertProfileToApiCredential(await aws_1.getAwsProfile(profileName));
    const lambda = new aws_sdk_1.Lambda({
        apiVersion: "2015-03-31",
        region,
        ...profile
    });
    const fns = await lambda.listFunctions().promise();
    return fns.Functions;
}
exports.getLambdaFunctions = getLambdaFunctions;
