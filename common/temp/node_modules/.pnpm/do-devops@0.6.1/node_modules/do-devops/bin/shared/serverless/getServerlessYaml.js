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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerlessYaml = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const errors_1 = require("../errors");
const js_yaml_1 = require("js-yaml");
/**
 * Get the `serverless.yml` file in the root of the project
 */
async function getServerlessYaml() {
    const baseStructure = {
        functions: {},
        stepFunctions: { stateMachines: {} },
    };
    try {
        const fileContents = fs.readFileSync(path.join(process.cwd(), "serverless.yml"), {
            encoding: "utf-8",
        });
        const config = js_yaml_1.load(fileContents);
        return { ...baseStructure, ...config };
    }
    catch (e) {
        throw new errors_1.DevopsError(`Failure getting serverless.yml: ${e.message}`, e.name);
    }
}
exports.getServerlessYaml = getServerlessYaml;
