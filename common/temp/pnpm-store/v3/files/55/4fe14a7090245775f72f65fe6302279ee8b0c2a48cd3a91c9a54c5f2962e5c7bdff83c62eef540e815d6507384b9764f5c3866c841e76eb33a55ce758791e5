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
exports.handler = void 0;
const shared_1 = require("../../../shared");
const private_1 = require("../private");
const chalk = require("chalk");
async function handler(args, opt) {
    let test;
    try {
        const config = await shared_1.getConfig();
        if (!config.test || !config.test.unitTestFramework) {
            const unitTestFramework = await private_1.askForUnitTestFramework();
            const g = shared_1.git();
            const sourceFiles = (await g.status()).files.map((f) => f.path).filter((p) => p.includes("src/"));
            if (sourceFiles.length === 0 && opt.onSourceChanged) {
                console.log(chalk `- skipping tests because no {italic source} files were changed!`);
                process.exit();
            }
            await shared_1.writeSection("test", { ...config.test, ...unitTestFramework }, "project");
        }
        if (config?.test.unitTestFramework === "mocha") {
            test = (await Promise.resolve().then(() => __importStar(require("../private/mocha")))).default;
        }
        else if (config?.test.unitTestFramework === "jest") {
            test = (await Promise.resolve().then(() => __importStar(require("../private/jest")))).default;
        }
        else {
            test = (await Promise.resolve().then(() => __importStar(require("../private/other")))).default;
        }
        await test(args);
    }
    catch (e) {
        console.log(`- Error finding functions: ${e.message}\n`);
        process.exit();
    }
}
exports.handler = handler;
