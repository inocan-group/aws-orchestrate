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
exports.handler = exports.options = exports.syntax = exports.description = exports.defaultConfig = void 0;
const shared_1 = require("../shared");
const deploy_helpers_1 = require("./deploy-helpers");
const chalk = require("chalk");
exports.defaultConfig = {
    preDeployHooks: ["clean"],
    target: "serverless",
    showUnderlyingCommands: true,
    sandboxing: "user",
};
async function description(opts) {
    const base = `Deployment services that for {bold Serverless} or {bold NPM} publishing.\n\n`;
    const { deploy: config } = await shared_1.getConfig();
    const detect = await deploy_helpers_1.detectTarget();
    const possibleTargets = {
        serverless: chalk `This project was detected to be a {bold Serverless} project. Unless you state explicitly that you want to use {bold NPM} targetting it will use Serverless.`,
        npm: chalk `This project was detected to be a {bold NPM} project. Unless you state explicitly that you want to use "serverless" targetting it will use NPM. `,
        both: chalk `This project was detected to have both {bold Serverless} functions {italic and} be an {bold NPM} library. By default the deploy command will assume you want to use {bold Serverless} deployment but the {italic options} listed below allow for both targets.`,
        bespoke: "not implemented yet",
    };
    return base + possibleTargets[detect.target];
}
exports.description = description;
exports.syntax = "do deploy [fn1] [fn2] <options>\n\n{dim Note: {italic stating particular functions is {italic optional} and if excluded will result in a full deployment of all functions.}}";
async function options(opts) {
    const { deploy: config } = await shared_1.getConfig();
    const target = opts.target || config.target;
    return [
        {
            name: "interactive",
            alias: "i",
            type: Boolean,
            group: "serverlessDeploy",
            description: `allow interactive choices for the functions you want to deploy`,
        },
        {
            name: "target",
            alias: "t",
            typeLabel: "<target>",
            type: String,
            group: "deploy",
            description: "manually override the project target (serverless, npm)",
        },
        {
            name: "stage",
            alias: "s",
            typeLabel: "<stage>",
            type: String,
            group: "serverlessDeploy",
            description: "manually override the stage you're deploying to",
        },
        {
            name: "region",
            alias: "r",
            typeLabel: "<region>",
            type: String,
            group: "serverlessDeploy",
            description: "explicitly state the region you're deploying to",
        },
    ];
}
exports.options = options;
/**
 * **Deploy Handler**
 *
 * The _deploy_ command is used when you want to push your changes
 * to an environment where they will be used. This can mean different
 * things based on context and this handler will support the following
 * deployment scenarios:
 *
 * 1. Deploy to `npm` (aka, publish)
 * 2. Deploy to a serverless environment by leveraging the **Serverless** framework
 *
 * Over time we may add other targets for deployment.
 */
async function handler(argv, opts) {
    // const { deploy, global } = await getConfig();
    let { target } = await deploy_helpers_1.detectTarget(opts);
    if (target === "both") {
        const ask = (await Promise.resolve().then(() => __importStar(require(`./deploy-helpers/deploy-${target}`)))).default;
        target = await ask(opts);
    }
    if (!target) {
        console.log(`  - ${"\uD83D\uDCA9" /* poop */} You must state a valid "target" [ ${target ? target + "{italic not valid}" : "no target stated"} ]`);
    }
    // await runHooks(deploy.preDeployHooks);
    const helper = (await Promise.resolve().then(() => __importStar(require(`./deploy-helpers/deploy-${target}`)))).default;
    await helper(argv, opts);
}
exports.handler = handler;
