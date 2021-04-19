"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForAccountInfo = void 0;
const common_types_1 = require("common-types");
const shared_1 = require("../../../shared");
const inquirer = require("inquirer");
const chalk = require("chalk");
/**
 * Allows the properties not yet defined in the configuration to be
 * interactively added.
 *
 * @param config the configuration as it has been defined so far
 */
async function askForAccountInfo(config = {}) {
    const pkgJson = await shared_1.getPackageJson();
    const profiles = await shared_1.getAwsProfileList();
    const profileMessage = "choose a profile from your AWS credentials file";
    if (config.profile &&
        config.name &&
        config.accountId &&
        config.region &&
        config.pluginsInstalled &&
        (config.logForwarding || !Object.keys(pkgJson.devDependencies).includes("serverless-log-forwarding"))) {
        return config;
    }
    const baseProfileQuestion = {
        name: "profile",
        message: "Choose a profile from your AWS credentials file",
        default: config.profile,
        when: () => !config.profile,
    };
    const profileQuestion = profiles
        ? {
            ...baseProfileQuestion,
            ...{
                type: "list",
                choices: Object.keys(profiles),
            },
        }
        : { ...baseProfileQuestion, ...{ type: "input" } };
    let questions = [
        {
            type: "input",
            name: "name",
            message: "What is the Service Name for this repo?",
            default: config.name || pkgJson.name,
            when: () => !config.name,
        },
        profileQuestion,
    ];
    let answers = await inquirer.prompt(questions);
    const merged = {
        ...config,
        ...answers,
    };
    if (!shared_1.userHasAwsProfile(merged.profile)) {
        console.log(chalk `- you are deploying with the {green ${merged.profile} AWS profile but you do not have this defined yet! ${"\uD83D\uDE21" /* angry */}`);
        console.log(chalk `{grey - AWS profiles must be added in {blue ~/.aws/credentials}}`);
        console.log(chalk `{grey - if you want to override the default behavior you can state a different profile with the {blue --profile} tag}`);
        process.exit();
    }
    if (!merged.profile) {
        console.log(chalk `- you have not provided an AWS {bold profile}; exiting ...`);
        process.exit();
    }
    if (!(await shared_1.userHasAwsProfile(merged.profile))) {
        console.log(chalk `- you do {bold NOT} have the credentials for the profile {blue ${merged.profile}}! Please add this before\n  trying again. ${"\uD83D\uDE21" /* angry */}\n`);
        console.log(chalk `{grey - the credentials file is located at {blue ~/.aws/credentials}}\n`);
        process.exit();
    }
    const awsProfile = await shared_1.getAwsProfile(merged.profile);
    if (merged.region) {
        config.region = awsProfile.region;
    }
    if (!merged.accountId) {
        console.log(chalk `- looking up the Account ID for the given profile`);
        try {
            merged.accountId = (await shared_1.getAwsIdentityFromProfile(awsProfile)).accountId;
        }
        catch (e) { }
    }
    questions = [
        {
            type: "input",
            name: "accountId",
            message: "what is the Amazon Account ID which you are deploying to?",
            when: () => !merged.accountId,
        },
        {
            type: "list",
            name: "region",
            message: "what is the region you will be deploying to?",
            choices: common_types_1.AWS_REGIONS,
            default: merged.region || awsProfile.region || "us-east-1",
            when: () => !config.region,
        },
    ];
    let plugins;
    try {
        const sls = await shared_1.getServerlessYaml();
        plugins = { pluginsInstalled: sls.plugins };
    }
    catch (e) {
        plugins = { pluginsInstalled: [] };
    }
    answers = {
        ...plugins,
        ...answers,
        ...(await inquirer.prompt(questions)),
    };
    return merged;
}
exports.askForAccountInfo = askForAccountInfo;
