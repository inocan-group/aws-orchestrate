"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.options = exports.description = void 0;
const chalk_1 = __importDefault(require("chalk"));
const shared_1 = require("../shared");
const async_shelljs_1 = require("async-shelljs");
const getLocalServerlessFunctionsFromServerlessYaml_1 = require("../shared/serverless/getLocalServerlessFunctionsFromServerlessYaml");
function description() {
    return `invoke serverless functions locally, leveraging test data where desired`;
}
exports.description = description;
exports.options = [
    {
        name: "stage",
        type: String,
        typeLabel: "<stage>",
        group: "invoke",
        description: `state the "stage" you want to emulate with invokation`,
    },
    {
        name: "data",
        type: String,
        typeLabel: "<dataFile>",
        group: "invoke",
        description: `use a known data input`,
    },
    {
        name: "interactive",
        alias: "i",
        type: Boolean,
        group: "invoke",
        description: "bring up an interactive dialog to choose the data file",
    },
];
async function handler(args, opts) {
    try {
        const sls = await shared_1.isServerless();
        if (!sls) {
            console.log(chalk_1.default `{red - This project is not configured as a {bold Serverless} project!} ${"\uD83D\uDE21" /* angry */}\n`);
            process.exit();
        }
        if (args.length > 1) {
            console.log(chalk_1.default `{dim - you have stated more than one function to {italic invoke}.}`);
            console.log(chalk_1.default `{dim - this command only executes one at a time; the rest are ignored.}`);
        }
        let fn;
        if (args.length === 0) {
            fn = await shared_1.askForFunction();
        }
        else {
            fn = args[0];
            const availableFns = Object.keys(await getLocalServerlessFunctionsFromServerlessYaml_1.getLocalServerlessFunctionsFromServerlessYaml());
            if (!availableFns.includes(fn)) {
                console.log(chalk_1.default `{red - The function "{white ${fn}}" is not a valid function!} ${"\uD83D\uDE32" /* shocked */}`);
                console.log(`- valid functions are:`);
                console.log(chalk_1.default `{dim   - ${availableFns.join("\n  - ")}}`);
                process.exit();
            }
        }
        let data;
        if (opts.data) {
            try {
                data = await shared_1.readDataFile(opts.data, "json");
            }
            catch (e) {
                const possible = await shared_1.getDataFiles({
                    filterBy: opts.data,
                });
                if (possible.length > 1) {
                    data = await shared_1.askForDataFile(possible);
                }
                else if (possible.length === 1) {
                    data = await shared_1.readDataFile(possible[0]);
                }
                else {
                    console.log(chalk_1.default `{red - Data file "${opts.data}" not found!}`);
                    data = await shared_1.askForDataFile();
                }
            }
        }
        if (opts.interactive) {
            data = await shared_1.askForDataFile();
        }
        if (!opts.quiet) {
            console.log(chalk_1.default `{grey > sls invoke local --function {dim {white ${fn}}} --data '{dim {white ${data}}}'}`);
        }
        await async_shelljs_1.asyncExec(`sls invoke local --function ${fn} --data '${data}'`);
    }
    catch (e) {
        console.log(`- Error finding functions: ${e.message}\n`);
        process.exit();
    }
}
exports.handler = handler;
