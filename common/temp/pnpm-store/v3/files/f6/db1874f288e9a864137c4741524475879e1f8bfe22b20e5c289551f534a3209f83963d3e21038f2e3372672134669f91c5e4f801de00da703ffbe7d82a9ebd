"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountInfoFromServerlessYaml = void 0;
const chalk_1 = __importDefault(require("chalk"));
const getServerlessYaml_1 = require("./getServerlessYaml");
/**
 * Gets the `accountInfo` from the `serverless.yml` file if
 * possible. If not it returns an empty object.
 */
async function getAccountInfoFromServerlessYaml() {
    try {
        const config = await getServerlessYaml_1.getServerlessYaml();
        const info = {
            name: typeof config.service === "string" ? config.service : config.service.name,
            accountId: config.custom.accountId,
            region: config.provider.region,
            profile: config.provider.profile,
            pluginsInstalled: config.plugins || [],
            // tracing: (config as any).tracing
        };
        if (config.custom.logForwarding) {
            info.logForwarding = config.custom.logForwarding.destinationARN;
        }
        return info;
    }
    catch (e) {
        console.log(chalk_1.default `{grey - Unable to get account info from {green serverless.yml}}`);
        return {};
    }
}
exports.getAccountInfoFromServerlessYaml = getAccountInfoFromServerlessYaml;
