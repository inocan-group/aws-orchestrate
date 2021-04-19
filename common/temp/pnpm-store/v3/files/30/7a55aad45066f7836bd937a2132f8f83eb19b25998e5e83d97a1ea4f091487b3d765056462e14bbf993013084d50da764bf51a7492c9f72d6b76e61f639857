"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTarget = void 0;
const shared_1 = require("../../shared");
/**
 * Detects the target type and also looks to see if it has
 * been overriden by CLI params
 */
async function detectTarget(opts) {
    const { deploy: config } = await shared_1.getConfig();
    const override = opts ? opts.target : undefined;
    const serverless = await shared_1.isServerless();
    const npm = await shared_1.isNpmPackage();
    const detected = serverless && !npm
        ? "serverless"
        : npm && !serverless
            ? "npm"
            : npm && serverless
                ? "both"
                : "unknown";
    return {
        detected,
        override: override && override !== detected ? override : false,
        target: override || detected
    };
}
exports.detectTarget = detectTarget;
