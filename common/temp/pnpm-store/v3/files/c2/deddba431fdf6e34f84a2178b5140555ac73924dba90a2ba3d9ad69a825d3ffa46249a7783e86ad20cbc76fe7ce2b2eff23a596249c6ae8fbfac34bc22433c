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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isServerless = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const npm_1 = require("../npm");
const getServerlessYaml_1 = require("./getServerlessYaml");
/**
 * returns a set of flags indicating whether it appears the serverless framework
 * is being used in this repo
 */
async function isServerless() {
    const hasServerlessConfig = fs.existsSync(path.join(process.cwd(), "serverless.yml"));
    let slsConfig;
    try {
        slsConfig = await getServerlessYaml_1.getServerlessYaml();
    }
    catch (e) {
        //
    }
    const pkgJson = npm_1.getPackageJson();
    const hasAsDevDep = pkgJson ? Object.keys(pkgJson.devDependencies).includes("serverless") : false;
    const isUsingTypescriptMicroserviceTemplate = fs.existsSync(path.join(process.cwd(), "serverless-config/config.ts"));
    const hasProviderSection = slsConfig && slsConfig.provider ? true : false;
    const configIsParsable = hasServerlessConfig && slsConfig ? true : false;
    return hasServerlessConfig || hasAsDevDep || isUsingTypescriptMicroserviceTemplate
        ? {
            hasServerlessConfig,
            hasAsDevDep,
            isUsingTypescriptMicroserviceTemplate,
            hasProviderSection,
            configIsParsable,
        }
        : false;
}
exports.isServerless = isServerless;
