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
exports.saveToServerlessYaml = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const js_yaml_1 = require("js-yaml");
const util_1 = require("util");
const writeFile = util_1.promisify(fs.writeFile);
async function saveToServerlessYaml(data) {
    try {
        const filename = path.join(process.cwd(), "serverless.yml");
        console.log({ filename, data });
        const yamlData = js_yaml_1.dump(data);
        await writeFile(filename, yamlData, { encoding: "utf-8" });
    }
    catch (e) {
        console.log(chalk_1.default `- {red writing the {bold serverless.yml} file has failed!} ${"\uD83D\uDCA9" /* poop */}`);
        console.log(e.message);
        console.log(chalk_1.default `{dim ${e.stack}}`);
        process.exit();
    }
}
exports.saveToServerlessYaml = saveToServerlessYaml;
