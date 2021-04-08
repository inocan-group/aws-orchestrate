import { ILoggerApi, logger } from "aws-log";
import { IDictionary } from "common-types";
import { SSM } from "aws-ssm";
import { flatten } from "native-dash";

let localSecrets: IDictionary = {};

function escapeRegExp(s: string) {
  return s.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&"); // $& means the whole matched string
}

/**
 * Goes through a set of secrets -- organized by `[module].[name] = secret` --
 * and masks the values so that they don't leak into the log files.
 */
export function maskLoggingForSecrets(modules: IDictionary, log: ILoggerApi) {
  const secretPaths: string[] = [];
  for (const module of Object.keys(modules)) {
    for (const s of Object.keys(modules[module])) {
      const escapedString = escapeRegExp(modules[module][s]);
      log.addToMaskedValues(escapedString);
      secretPaths.push(`${module}/${s}`);
    }
  }
  if (secretPaths.length > 0) {
    log.debug(`All secret values [ ${secretPaths.length} ] have been masked in logging`, {
      secretPaths,
    });
  } else {
    log.debug("No secrets where added in this function's call; no additional log masking needed.");
  }
}

/**
 * Saves secrets locally so they can be used rather than
 * going out to SSM. These secrets will then also be "passed
 * forward" to any functions which are invoked.
 */
export function saveSecretsLocally(secrets: IDictionary) {
  localSecrets = secrets;
}

/**
 * Adds a new secret to the existing cache of secrets.
 */
export function addSecretToLocalCache(name: string, value: any) {
  localSecrets[name] = value;
}

/**
 * Gets the locally stored secrets. The format of the keys in this hash
 * should be `{ module1: { NAME: value, NAME2: value} }` which cooresponds
 * to the `aws-ssm` opinion on SSM naming.
 */
export function getLocalSecrets() {
  return localSecrets;
}

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
export async function getSecrets(...modules: string[] | string[][]): Promise<IDictionary<IDictionary>> {
  // segment.addAnnotation("getSecrets", "starting");
  const mods: string[] = flatten<any>(modules);
  const log = logger().reloadContext();
  const localSecrets = getLocalSecrets();
  if (mods.every((index: string) => Object.keys(localSecrets).includes(index))) {
    // everything found in local secrets
    log.debug("Call to getSecrets() resulted in 100% hit rate for modules locally", { modules: mods });
    // segment.addAnnotation("getSecrets", "finished:onlyLocal");
    return mods.reduce((secrets: IDictionary, module: string) => {
      secrets[module] = localSecrets[module];
      return secrets;
    }, {});
  }

  // at least SOME modules are NOT stored locally, the latency of getting some
  // versus getting them all is negligible so we'll get them all from SSM
  log.debug("Some modules requested were not found locally, requesting from SSM.", { modules: mods });
  const newSecrets = await SSM.modules(mods);
  for (const m of mods) {
    if (!newSecrets[m]) {
      throw new Error(`Failure to retrieve the SSM module "${m}"`);
    }

    if (Object.keys(newSecrets[m]).length === 0) {
      log.warn(`Attempt to retrieve module "${m}" returned but had no `);
    }
  }
  log.debug("new SSM modules retrieved");
  const secrets = {
    ...localSecrets,
    ...newSecrets,
  };
  saveSecretsLocally(secrets);
  maskLoggingForSecrets(newSecrets, log);
  // segment.addAnnotation("getSecrets", "finished:awsRequest");
  return secrets;
}
