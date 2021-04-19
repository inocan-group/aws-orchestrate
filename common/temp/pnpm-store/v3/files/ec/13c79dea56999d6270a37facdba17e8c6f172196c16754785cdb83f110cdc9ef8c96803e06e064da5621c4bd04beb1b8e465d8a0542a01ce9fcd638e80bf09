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
exports.buildLambdaTypescriptProject = void 0;
const chalk_1 = __importDefault(require("chalk"));
const os = __importStar(require("os"));
const async_shelljs_1 = require("async-shelljs");
const shared_1 = require("../../../shared");
const ACCOUNT_INFO_YAML = "./serverless-config/account-info.yml";
/**
 * Builds a `serverless.yml` file from the configuration
 * available in the `/serverless-config` directory.
 *
 * The key requirement here is that the `accountInfo` hash is
 * built out. This information will be gathered from the
 * following sources (in this order):
 *
 * 1. look within the `serverless.yml` for info (if it exists)
 * 2. ask the user for the information (saving values as default for next time)
 */
async function buildLambdaTypescriptProject(opts = {}, config = {}, 
/** modern scaffolding will pass in the config function to be managed here in this process */
configFn) {
    const modern = shared_1.getYeomanScaffolds().includes("generator-lambda-typescript");
    const accountInfo = await shared_1.getServerlessBuildConfiguration();
    const hasWebpackPlugin = accountInfo?.devDependencies?.includes("serverless-webpack");
    const buildSystem = config.buildTool;
    // force transpilation
    if (opts.force) {
        // await serverlessTranspilation({ argv, opts, config, tooling, serverless });
    }
    if (!modern) {
        // temporarily lay down a config file
        shared_1.saveYamlFile(ACCOUNT_INFO_YAML, accountInfo);
    }
    console.log(chalk_1.default `- The account info for {bold ${accountInfo.name} [ }{dim ${accountInfo.accountId}} {bold ]} has been gathered`);
    const handlerInfo = shared_1.getLocalHandlerInfo();
    console.log(chalk_1.default `{grey - handler functions [ {bold ${String(handlerInfo.length)}} ] have been identified}`);
    await shared_1.createInlineExports(handlerInfo);
    console.log(chalk_1.default `{grey - The inline function configuration file [ {bold {italic serverless-config/functions/inline.ts}} ] has been configured}`);
    await shared_1.createFunctionEnum(handlerInfo);
    console.log(chalk_1.default `{grey - The enumeration and type [ {bold {italic src/@types/functions.ts}} ] for the available functions has been configured }`);
    if (!hasWebpackPlugin) {
        // the preferred means of bundling using webpack
        await shared_1.createWebpackEntryDictionaries(handlerInfo.map((i) => i.source));
        console.log(chalk_1.default `{grey - added webpack {italic entry files} to facilitate code build and watch operations}`);
    }
    else {
        const exist = shared_1.filesExist("webpack.js-entry-points.json", "webpack.js-entry-points.json");
        if (exist) {
            async_shelljs_1.rm(...exist);
            console.log(chalk_1.default `- ${"\uD83D\uDC40" /* eyeballs */} removed webpack entry point files so as not to confuse with what the {italic serverless-webpack} plugin is doing}`);
        }
    }
    if (modern && configFn) {
        const serverless = configFn(accountInfo);
        await shared_1.saveToServerlessYaml(serverless);
    }
    else {
        console.log(chalk_1.default `- handing off the build of the {green {bold serverless.yml}} to the repo's {bold build} script\n`);
        await async_shelljs_1.asyncExec(`yarn ts-node serverless-config/build.ts --color=always`, {
            env: {
                ...process.env,
                TERM: "xterm-color",
                ...(os.platform().includes("win") ? {} : { shell: "/bin/bash" }),
            },
        });
        async_shelljs_1.rm(ACCOUNT_INFO_YAML);
        console.log(chalk_1.default `{grey - removed the temporary {blue account-info.yml} file from the repo}`);
    }
    console.log(chalk_1.default `{green - {bold serverless.yml} has been updated successfully ${"\uD83D\uDE80" /* rocket */}}\n`);
}
exports.buildLambdaTypescriptProject = buildLambdaTypescriptProject;
