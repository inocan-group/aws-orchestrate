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
exports.execute = void 0;
const chalk_1 = __importDefault(require("chalk"));
const process = __importStar(require("process"));
const aws_ssm_1 = require("aws-ssm");
const date_fns_1 = require("date-fns");
const table_1 = require("table");
const shared_1 = require("../../../../shared");
async function execute(argv, options) {
    const profile = await shared_1.determineProfile({ cliOptions: options, interactive: true });
    const profileInfo = await shared_1.getAwsProfile(profile);
    const region = options.region ||
        profileInfo.region ||
        (await shared_1.determineRegion({ cliOptions: options, interactive: true }));
    const filterBy = argv.length > 0 ? argv[0] : undefined;
    if (!profile || !region) {
        console.log(chalk_1.default `{red - missing information!}`);
        console.log(chalk_1.default `To list SSM params the AWS {italic profile} and {italic region} must be stated. These could {bold not} be determined so exiting.`);
        console.log(chalk_1.default `{dim note that the easiest way to get an explicit profile/region is to use the {bold --profile} and {bold --region} switches on the command line.}\n`);
        process.exit();
    }
    if (!options.quiet) {
        console.log(`- Listing SSM parameters in profile "${chalk_1.default.bold(profile)}", region "${chalk_1.default.bold(region)}"${filterBy ? `; results reduced to those with "${chalk_1.default.bold(filterBy)}" in the name.` : ""}`);
        console.log();
    }
    const ssm = new aws_ssm_1.SSM({
        profile,
        region,
    });
    const list = await ssm.describeParameters();
    let tableData = [
        [
            chalk_1.default.bold("Name"),
            chalk_1.default.bold("Version"),
            chalk_1.default.bold("Type"),
            chalk_1.default.bold("LastModified"),
            chalk_1.default.bold("User"),
        ],
    ];
    list
        .filter((i) => !filterBy || i.Name.includes(filterBy))
        .forEach((i) => {
        tableData.push([
            i.Name,
            String(i.Version),
            i.Type,
            date_fns_1.format(i.LastModifiedDate, "dd MMM, yyyy"),
            i.LastModifiedUser.replace(/.*user\//, ""),
        ]);
    });
    const tableConfig = {
        columns: {
            0: { width: 42, alignment: "left" },
            1: { width: 8, alignment: "center" },
            2: { width: 14, alignment: "center" },
            3: { width: 18, alignment: "center" },
            4: { width: 14 },
        },
    };
    console.log(table_1.table(tableData, tableConfig));
}
exports.execute = execute;
