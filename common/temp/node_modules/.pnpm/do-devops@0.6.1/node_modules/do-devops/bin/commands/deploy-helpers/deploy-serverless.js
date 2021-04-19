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
const chalk_1 = __importDefault(require("chalk"));
const shared_1 = require("../../shared");
const async_shelljs_1 = require("async-shelljs");
const index_1 = require("./index");
const sandbox_1 = require("../../shared/sandbox");
const index_2 = require("../../shared/serverless/build/index");
/**
 * Manages the execution of a serverless deployment
 */
async function serverlessDeploy(argv, opts) {
    const stage = await shared_1.determineStage(opts);
    const { deploy: config } = await shared_1.getConfig();
    const meta = { stage, config: config, opts };
    // argv values indicate function deployment
    if (argv.length > 0) {
        await functionDeploy(argv, meta);
    }
    else {
        await fullDeploy(meta);
    }
}
exports.default = serverlessDeploy;
async function functionDeploy(fns, meta) {
    const { stage, opts, config } = meta;
    console.log(chalk_1.default `- {bold serverless} deployment for {bold ${String(fns.length)}} functions to {italic ${stage}} stage ${"\uD83C\uDF89" /* party */}`);
    const transpile = index_1.isTranspileNeeded(meta);
    if (transpile.length > 0) {
        const build = (await Promise.resolve().then(() => __importStar(require("../build-helpers/tools/webpack")))).default({
            opts: { fns: transpile },
        }).build;
        await build();
    }
    console.log(chalk_1.default `{grey - zipping up ${String(fns.length)} {bold Serverless} {italic handler} functions }`);
    await index_2.zipWebpackFiles(fns);
    console.log(chalk_1.default `{grey - all handlers zipped; ready for deployment ${"\uD83D\uDC4D" /* thumbsUp */}}`);
    console.log(chalk_1.default `- deploying {bold ${String(fns.length)} functions} to "${stage}" stage`);
    const sandboxStage = stage === "dev" ? await sandbox_1.sandbox(stage) : stage;
    if (sandboxStage !== stage) {
    }
    fns.forEach((fn) => console.log(chalk_1.default.grey(`    - ${fn}`)));
    const promises = [];
    try {
        fns.map((fn) => {
            promises.push(async_shelljs_1.asyncExec(`sls deploy function --force --aws-s3-accelerate --function ${fn} --stage ${stage}`));
        });
        await Promise.all(promises);
        console.log(chalk_1.default `\n- all {bold ${String(fns.length)}} function(s) were deployed! ${"\uD83D\uDE80" /* rocket */}\n`);
    }
    catch (e) {
        console.log(chalk_1.default `- {red {bold problems deploying functions!}} ${"\uD83D\uDCA9" /* poop */}`);
        console.log(`- ${e.message}`);
        console.log(chalk_1.default `- {dim ${e.stack}}`);
    }
}
async function fullDeploy(meta) {
    const { stage, opts, config } = meta;
    console.log(chalk_1.default `- Starting {bold FULL serverless} deployment for {italic ${stage}} stage`);
    if (!shared_1.hasDevDependency("serverless-webpack")) {
        console.log(chalk_1.default `{grey - checking timestamps to determine what {bold webpack} transpilation is needed}`);
        const transpile = index_1.isTranspileNeeded(meta);
        if (transpile.length > 0) {
            const build = (await Promise.resolve().then(() => __importStar(require("../build-helpers/tools/webpack")))).default({
                opts: { fns: transpile },
            }).build;
            await build();
        }
        const fns = shared_1.getLocalHandlerInfo().map((i) => i.fn);
        console.log(chalk_1.default `{grey - zipping up all ${String(fns.length)} Serverless handlers}`);
        await index_2.zipWebpackFiles(fns);
        console.log(chalk_1.default `{grey - all handlers zipped; ready for deployment ${"\uD83D\uDC4D" /* thumbsUp */}}`);
    }
    if (config.showUnderlyingCommands) {
        console.log(chalk_1.default `{grey > {italic sls deploy --aws-s3-accelerate  --stage ${stage} --verbose}}\n`);
        try {
            await async_shelljs_1.asyncExec(`sls deploy --aws-s3-accelerate  --stage ${stage} --verbose`);
            console.log(chalk_1.default `\n- The full deploy was successful! ${"\uD83D\uDE80" /* rocket */}\n`);
        }
        catch (e) {
            console.log(chalk_1.default `- {red Error running deploy!}`);
            console.log(chalk_1.default `- NOTE: {dim if the error appears related to running out of heap memory then you can try {bold {yellow export NODE_OPTIONS=--max_old_space_size=4096}}}\n`);
        }
    }
}
