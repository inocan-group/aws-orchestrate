"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_log_1 = require("aws-log");
const aws_ssm_1 = require("aws-ssm");
const lodash_flatten_1 = __importDefault(require("lodash.flatten"));
// import { segment } from "../wrapper";
let localSecrets = {};
/**
 * Saves secrets locally so they can be used rather than
 * going out to SSM. These secrets will then also be "passed
 * forward" to any functions which are invoked.
 */
function saveSecretsLocally(secrets) {
    localSecrets = secrets;
}
exports.saveSecretsLocally = saveSecretsLocally;
/**
 * Adds a new secret to the existing cache of secrets.
 */
function addSecretToLocalCache(name, value) {
    localSecrets[name] = value;
}
exports.addSecretToLocalCache = addSecretToLocalCache;
/**
 * Gets the locally stored secrets. The format of the keys in this hash
 * should be `{ module1: { NAME: value, NAME2: value} }` which cooresponds
 * to the `aws-ssm` opinion on SSM naming.
 */
function getLocalSecrets() {
    return localSecrets;
}
exports.getLocalSecrets = getLocalSecrets;
/**
 * **getSecrets**
 *
 * Gets the needed secrets for this function -- using locally available information
 * if available (_params_ and/or _cached_ values from prior calls) -- otherwise
 * goes out to **SSM** to get.
 *
 * In addition, all secrets requested (within the given function as well as
 * _prior_ function's secrets in a sequence) will be auto-forwarded to subsequent
 * functions in the currently executing sequence. Secrets _will not_ be passed back
 * in the function's response.
 *
 * @param modules the modules which are have secrets that are needed; you may add an array
 * as the first parameter passed in or you can destructure values across the input
 */
async function getSecrets(...modules) {
    // segment.addAnnotation("getSecrets", "starting");
    const mods = lodash_flatten_1.default(modules);
    const log = aws_log_1.logger().reloadContext();
    const localSecrets = getLocalSecrets();
    if (mods.every(i => Object.keys(localSecrets).includes(i))) {
        // everything found in local secrets
        log.debug(`Call to getSecrets() resulted in 100% hit rate for modules locally`, { modules: mods });
        // segment.addAnnotation("getSecrets", "finished:onlyLocal");
        return mods.reduce((secrets, mod) => {
            secrets[mod] = localSecrets[mod];
            return secrets;
        }, {});
    }
    // at least SOME modules are NOT stored locally, the latency of getting some
    // versus getting them all is negligible so we'll get them all from SSM
    log.debug(`Some modules requested were not found locally, requesting from SSM.`, { modules: mods });
    const newSecrets = await aws_ssm_1.SSM.modules(mods);
    mods.forEach(m => {
        if (!newSecrets[m]) {
            throw new Error(`Failure to retrieve the SSM module "${m}"`);
        }
        if (Object.keys(newSecrets[m]).length === 0) {
            log.warn(`Attempt to retrieve module "${m}" returned but had no `);
        }
    });
    log.debug(`new SSM modules retrieved`);
    const secrets = Object.assign(Object.assign({}, localSecrets), newSecrets);
    saveSecretsLocally(secrets);
    maskLoggingForSecrets(newSecrets, log);
    // segment.addAnnotation("getSecrets", "finished:awsRequest");
    return secrets;
}
exports.getSecrets = getSecrets;
/**
 * Goes through a set of secrets -- organized by `[module].[name] = secret` --
 * and masks the values so that they don't leak into the log files.
 */
function maskLoggingForSecrets(modules, log) {
    let secretPaths = [];
    Object.keys(modules).forEach(mod => {
        Object.keys(mod).forEach(s => {
            if (typeof s === "object") {
                log.addToMaskedValues(modules[mod][s]);
                secretPaths.push(`${mod}/${s}`);
            }
        });
    });
    if (secretPaths.length > 0) {
        log.debug(`All secret values [ ${secretPaths.length} ] have been masked in logging`, {
            secretPaths
        });
    }
    else {
        log.debug(`No secrets where added in this function's call; no additional log masking needed.`);
    }
}
exports.maskLoggingForSecrets = maskLoggingForSecrets;
//# sourceMappingURL=secrets.js.map