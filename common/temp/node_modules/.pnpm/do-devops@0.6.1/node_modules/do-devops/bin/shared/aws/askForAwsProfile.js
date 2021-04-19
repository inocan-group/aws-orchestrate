"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForAwsProfile = void 0;
const chalk_1 = __importDefault(require("chalk"));
const index_1 = require("../errors/index");
const index_2 = require("./index");
const inquirer = require("inquirer");
/**
 * Asks the user to choose an AWS profile
 */
async function askForAwsProfile(opts) {
    opts = opts ? { exitOnError: false, ...opts } : { exitOnError: false };
    const profiles = await index_2.getAwsProfileList();
    const profileNames = Object.keys(profiles);
    if (!profiles) {
        const message = `Attempt to "ask" for the AWS profile assumes there is at least one defined AWS profile in the credentials file but that could not be found.`;
        if (opts.exitOnError) {
            console.log(chalk_1.default `{red - Missing AWS credentials file}`);
            console.log(message + "\n");
            process.exit();
        }
        throw new index_1.DevopsError(message, "devops/not-allowed");
    }
    const defaultProfile = opts.defaultProfile
        ? profiles[opts.defaultProfile] || profiles[profileNames[0]]
        : profiles[profileNames[0]];
    const question = {
        name: "profile",
        type: "list",
        choices: Object.keys(profiles),
        message: "choose a profile from your AWS credentials file",
        default: defaultProfile,
        when: () => true,
    };
    const answer = await inquirer.prompt(question);
    return answer.profile;
}
exports.askForAwsProfile = askForAwsProfile;
