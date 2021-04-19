"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const shared_1 = require("../../../../shared");
const chalk = require("chalk");
const aws_ssm_1 = require("aws-ssm");
const index_1 = require("../index");
const native_dash_1 = require("native-dash");
async function execute(argv, options) {
    if (argv.length < 2) {
        console.log(chalk `The "do ssm set" command expects the variable name and value as parameters on the command line: {blue {bold do ssm set} <{italic name}> <{italic value}>}\n`);
        console.log(chalk `{grey {bold - Note:} you can include a {italic partial name} for the variable and things like the AWS profile, region, stage, and version number\n  will be filled in where possible}\n`);
        process.exit(1);
    }
    let [name, value] = argv;
    const profile = await shared_1.determineProfile({ cliOptions: options, interactive: true });
    const profileInfo = await shared_1.getAwsProfile(profile);
    const identity = await shared_1.getAwsIdentityFromProfile(profileInfo);
    const region = options.region ||
        profileInfo.region ||
        (await shared_1.determineRegion({ cliOptions: options }));
    const stage = options.stage ||
        process.env.AWS_STAGE ||
        process.env.NODE_ENV ||
        (await shared_1.askForStage(chalk `SSM variables should be namespaced to a STAGE, what stage are you setting for {dim [ profile: {italic ${profile}}, region: {italic ${region}}, account: {italic ${identity.accountId}} ]}?`));
    const ssm = new aws_ssm_1.SSM({ profile, region });
    name = await index_1.completeSsmName(name, { stage });
    if (options.base64) {
        value = native_dash_1.toBase64(value);
    }
    process.env.AWS_STAGE = stage;
    try {
        await ssm.put(name, value, {
            description: options.description,
            override: options.force,
        });
        console.log(chalk `\n- ${"\uD83C\uDF89" /* party */} the {bold {yellow ${name}}} variable was set successfully to the {italic ${region}} region {dim [ profile: {italic ${profile}}, region: {italic ${region}}, account: {italic ${identity.accountId}} ]}\n`);
    }
    catch (e) {
        console.log();
        if (e.code === "ParameterAlreadyExists") {
            console.log(chalk `- {red {bold Paramater Already Exists!}} to overwrite a parameter which already exists you must add {blue --force} to the CLI command`);
        }
        else {
            console.log(chalk `{red {bold Error:}} ${e.message}`);
        }
        console.log();
        process.exit(1);
    }
}
exports.execute = execute;
