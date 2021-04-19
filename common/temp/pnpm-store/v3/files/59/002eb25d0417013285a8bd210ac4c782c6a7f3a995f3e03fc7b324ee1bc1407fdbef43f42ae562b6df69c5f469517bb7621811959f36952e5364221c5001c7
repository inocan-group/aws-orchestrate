"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const chalk_1 = __importDefault(require("chalk"));
const shared_1 = require("../../../../shared");
const native_dash_1 = require("native-dash");
const aws_ssm_1 = require("aws-ssm");
const date_fns_1 = require("date-fns");
const table_1 = require("table");
async function execute(argv, options) {
    const profile = await shared_1.determineProfile({ cliOptions: options, interactive: true });
    const profileInfo = await shared_1.getAwsProfile(profile);
    const region = options.region ||
        profileInfo.region ||
        (await shared_1.determineRegion({ cliOptions: options, interactive: true }));
    const secrets = argv;
    const nonStandardPath = options.nonStandardPath;
    const { width } = await shared_1.consoleDimensions();
    if (!region) {
        throw new shared_1.DevopsError(`Getting SSM secrets requires an ${chalk_1.default.bold("AWS Region")} and none could be deduced. You can explicitly state this by adding "--region XYZ" to the command.`);
    }
    if (!profile) {
        throw new shared_1.DevopsError(`Getting SSM secrets requires an ${chalk_1.default.bold("AWS Profile")} and none could be deduced. You can explicitly state this by adding "--profile XYZ" to the command.`);
    }
    if (!options.quiet) {
        console.log(`- Getting SSM details for: ${chalk_1.default.italic.grey.bold(secrets.join(", "))}\n`);
    }
    const tableConfig = {
        columns: {
            0: { width: 30, alignment: "left" },
            1: { width: width > 125 ? 60 : width > 100 ? 40 : 35 },
            2: { width: 8, alignment: "center" },
            3: { width: 16, alignment: "center" },
        },
    };
    const ssm = new aws_ssm_1.SSM({ profile, region });
    for await (const secret of secrets) {
        let tableData = [
            [
                chalk_1.default.yellow.bold("Path"),
                chalk_1.default.yellow.bold("ARN"),
                chalk_1.default.yellow.bold("Version"),
                chalk_1.default.yellow.bold("LastUpdated"),
            ],
        ];
        const data = await ssm.get(secret, { decrypt: true, nonStandardPath });
        tableData.push([
            data.path,
            data.arn,
            String(data.version),
            date_fns_1.format(data.lastUpdated, "dd MMM, yyyy"),
        ]);
        const value = options.base64 ? native_dash_1.fromBase64(String(data.value)) : String(data.value);
        if (!options.quiet) {
            console.log(table_1.table(tableData, tableConfig));
            console.log(chalk_1.default.yellow.bold("VALUE:\n"));
            console.log(value);
            console.log();
        }
        else {
            console.log(value);
        }
    }
    // let content;
    // if (width > 130) {
    //   content = table(tableData, tableConfig as any);
    // } else if (width > 115) {
    //   delete tableConfig.columns["3"];
    //   content = table(tableData.map(i => i.slice(0, 3)), tableConfig as any);
    // } else {
    //   delete tableConfig.columns["2"];
    //   delete tableConfig.columns["3"];
    //   content = table(tableData.map(i => i.slice(0, 2)), tableConfig as any);
    // }
    // console.log(content);
}
exports.execute = execute;
