"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notReady = void 0;
const SsmError_1 = require("./SsmError");
// import { inverted } from "./bin/ssm";
/**
 * Produces an error to indicate that the `stage` could not be determined for the
 * given path and associated ENV variables.
 */
function notReady(name) {
    throw new SsmError_1.SsmError("aws-ssm/not-ready", `You must set an environment "stage" before using the SSM api. To do this, set either AWS_STAGE or NODE_ENV.\n  Alternatively you can pass in { nonStandardPath: true } to the options property of get(), set(), list(), or delete().`);
}
exports.notReady = notReady;
//# sourceMappingURL=notReady.js.map