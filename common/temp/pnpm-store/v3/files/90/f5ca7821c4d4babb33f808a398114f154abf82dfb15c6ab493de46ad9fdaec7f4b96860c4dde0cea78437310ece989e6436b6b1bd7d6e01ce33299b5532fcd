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
exports.determineStage = void 0;
const chalk_1 = __importDefault(require("chalk"));
const process = __importStar(require("process"));
const index_1 = require("./index");
const lodash_1 = require("lodash");
/**
 * Uses various methods to determine which _stage_
 * the serverless function should be deployed to.
 * If the stage can not be determined than the user
 * will be asked interactively.
 *
 * @param opts the CLI options hash (which includes stage as
 * a possible parameter)
 */
async function determineStage(opts) {
    try {
        let stage = lodash_1.get(opts, "stage") || process.env.NODE_ENV || process.env.AWS_STAGE;
        if (!stage) {
            try {
                stage = lodash_1.get(await index_1.getServerlessYaml(), "provider.stage", undefined);
            }
            catch (e) { }
        }
        if (opts.interactive) {
            stage = await index_1.askForStage();
        }
        return stage;
    }
    catch (e) {
        console.log(chalk_1.default `- attempts to get the desired "stage" have failed! ${"\uD83D\uDCA9" /* poop */}`);
        console.log(chalk_1.default `- {red ${e.message}}`);
        console.log(chalk_1.default `{dim ${e.stack}}`);
        console.log();
        process.exit();
    }
}
exports.determineStage = determineStage;
