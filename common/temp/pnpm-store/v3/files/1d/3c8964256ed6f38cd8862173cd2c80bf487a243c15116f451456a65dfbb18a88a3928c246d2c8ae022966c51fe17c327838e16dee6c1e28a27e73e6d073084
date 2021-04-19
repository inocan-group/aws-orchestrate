"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMicroserviceConfig = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const errors_1 = require("../errors");
const async_shelljs_1 = require("async-shelljs");
/**
 * Gets the typescript configuration file for serverless
 * projects which use the `typescript-microservice` yeoman
 * template and generates a `serverless.yml` file from it.
 */
async function getMicroserviceConfig(accountInfo) {
    const cliFile = path.join(process.env.PWD, "serverless-config", "build.ts");
    try {
        const config = await async_shelljs_1.asyncExec(`yarn ts-node ${cliFile} '${JSON.stringify(accountInfo)}'`, {
            silent: true,
        });
        return config;
    }
    catch (e) {
        console.log(chalk_1.default `{yellow - failed executing ${cliFile}}`);
        throw new errors_1.DevopsError(`Problem getting the microservice config file [ ${cliFile} ]: ${e.message}`, "devops/missing-config");
    }
}
exports.getMicroserviceConfig = getMicroserviceConfig;
