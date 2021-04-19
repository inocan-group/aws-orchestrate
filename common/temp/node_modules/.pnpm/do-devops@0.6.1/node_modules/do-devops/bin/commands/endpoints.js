"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.options = exports.description = void 0;
const chalk_1 = __importDefault(require("chalk"));
const shared_1 = require("../shared");
const getApiGatewayEndpoints_1 = require("../shared/aws/getApiGatewayEndpoints");
exports.description = "Lists out all the endpoints defined in a given AWS profile/account.";
exports.options = [
    {
        name: "profile",
        type: String,
        typeLabel: "<profileName>",
        group: "endpoints",
        description: `set the AWS profile explicitly`,
    },
];
async function handler(args, opts) {
    const profileName = await shared_1.determineProfile({ cliOptions: opts });
    const region = await shared_1.determineRegion({ cliOptions: opts });
    try {
        console.log(chalk_1.default `- getting API {italic endpoints} for the profile {bold ${profileName}} [ ${region} ]`);
        // const endpoints = await getLambdaFunctions(opts);
        const endpoints = await getApiGatewayEndpoints_1.getApiGatewayEndpoints(profileName, region);
        console.log(JSON.stringify(endpoints, null, 2));
    }
    catch (e) { }
}
exports.handler = handler;
