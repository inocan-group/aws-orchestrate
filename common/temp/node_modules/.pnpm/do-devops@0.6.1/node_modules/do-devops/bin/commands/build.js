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
exports.handler = exports.description = exports.options = exports.defaultConfig = void 0;
const chalk_1 = __importDefault(require("chalk"));
const shared_1 = require("../shared");
const index_1 = require("./build-helpers/index");
const ast_1 = require("../shared/ast");
exports.defaultConfig = {
    preBuildHooks: ["clean"],
    targetDirectory: "dist",
    buildTool: "tsc",
};
exports.options = [
    {
        name: "force",
        type: Boolean,
        group: "build",
        description: `forces the transpiling of code when building a serverless project`,
    },
    {
        name: "interactive",
        alias: "i",
        type: Boolean,
        group: "build",
        description: `allows choosing the functions interactively`,
    },
];
function description() {
    return `Efficient and clear build pipelines for serverless and/or NPM libraries`;
}
exports.description = description;
async function handler(argv, opts) {
    const { build: config } = await shared_1.getConfig();
    const serverless = await shared_1.isServerless();
    const buildTool = opts.buildTool || config.buildTool || (await index_1.askBuildTool(serverless ? true : false));
    const tooling = (await Promise.resolve().then(() => __importStar(require(`./build-helpers/tools/${buildTool}`)))).default;
    if (opts.output && !opts.quiet) {
        console.log(chalk_1.default `{red - the "--output" option is a general option but has no meaning for the {bold build} command} ${"\uD83D\uDE21" /* angry */}. The build will continue, ignoring this flag.`);
    }
    if (serverless) {
        console.log(chalk_1.default `{bold {yellow - Starting SERVERLESS build process}}\n`);
        await shared_1.buildLambdaTypescriptProject(opts, config);
    }
    else {
        console.log(chalk_1.default `{bold {yellow - Starting code build process; using ${buildTool}}}`);
        const fns = argv.length > 0 ? argv : ast_1.getValidServerlessHandlers();
        await tooling({ fns, opts });
    }
    console.log(chalk_1.default `\n- {bold build} complete ${"\uD83C\uDF89" /* party */}\n`);
}
exports.handler = handler;
