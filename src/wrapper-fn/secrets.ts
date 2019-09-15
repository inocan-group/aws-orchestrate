import { IDictionary } from "common-types";
import { logger, ILoggerApi } from "aws-log";
import get from "lodash.get";

let localSecrets: IDictionary = {};

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
 * Allows getting a single secret out of either _locally_ stored secrets -- or
 * if not found -- going to **SSM** and pulling the module containing this secret.
 */
export async function getSecret(moduleAndName: string) {
  const log = logger().reloadContext();
  const localSecrets = getLocalSecrets();
  if (!moduleAndName.includes("/")) {
    throw new Error(
      `When using getSecret() you must state both the module and the NAME of the secret where the two are delimted by a "/" character.`
    );
  }
  const [module, name] = moduleAndName.split("/");
  if (get(localSecrets, `${module}.${name}`, false)) {
    log.debug(`getSecret("${moduleAndName}") found secret locally`, {
      module,
      name
    });
    return get(localSecrets, `${module}.${name}`);
  } else {
    log.debug(
      `getSecret("${moduleAndName}") did not find locally so asking SSM for module "${module}"`,
      { module, name, localModules: Object.keys(localSecrets) }
    );
    await getSecrets([module]);
    if (get(localSecrets, `${module}.${name}`, false)) {
      log.debug(`after SSM call for module "${module}" the secret was found`, {
        module,
        name
      });
      return get(localSecrets, `${module}.${name}`);
    } else {
      throw new Error(
        `Even after asking SSM for module "${module}" the secret "${name}" was not found!`
      );
    }
  }
}

/**
 * **getSecrets**
 *
 * Gets the needed secrets for this function -- using locally available information
 * if available (_params_ and/or _cached_ values from prior calls) -- otherwise
 * goes out **SSM** to get it.
 *
 * In addition, all secrets requested (within the given function as well as
 * _prior_ function's secrets in a sequence) will be auto-forwarded to subsequent
 * functions in the currently executing sequence. Secrets _will not_ be passed back
 * in the function's response.
 *
 * @param modules the modules which are have secrets that are needed
 */
export async function getSecrets(
  modules: string[]
): Promise<IDictionary<IDictionary>> {
  const log = logger().reloadContext();
  const localSecrets = getLocalSecrets();
  if (modules.every(i => Object.keys(localSecrets).includes(i))) {
    // everything found in local secrets
    log.debug(
      `Call to getSecrets() resulted in 100% hit rate for modules locally`,
      { modules }
    );
    return modules.reduce((secrets: IDictionary, mod: string) => {
      secrets[mod] = localSecrets[mod];
      return secrets;
    }, {});
  }

  // at least SOME modules are NOT stored locally, the latency of getting some
  // versus getting them all is negligible so we'll get them all from SSM
  log.debug(
    `Some modules requested were not found locally, requesting from SSM.`,
    { modules }
  );
  const SSM = (await import("aws-ssm")).SSM;
  const newSecrets = await SSM.modules(modules);
  modules.forEach(m => {
    if (!newSecrets[m]) {
      throw new Error(`Failure to retrieve the SSM module "${m}"`);
    }
    if (Object.keys(newSecrets[m]).length === 0) {
      log.warn(`Attempt to retrieve module "${m}" returned but had no `);
    }
  });
  log.debug(`new SSM modules retrieved`);
  const secrets = {
    ...localSecrets,
    ...newSecrets
  };
  saveSecretsLocally(secrets);
  maskLoggingForSecrets(newSecrets, log);

  return secrets;
}

/**
 * Goes through a set of secrets -- organized by `[module].[name] = secret` --
 * and masks the values so that they don't leak into the log files.
 */
export function maskLoggingForSecrets(modules: IDictionary, log: ILoggerApi) {
  let secretPaths: string[] = [];
  Object.keys(modules).forEach(mod => {
    Object.keys(mod).forEach(s => {
      if (typeof s === "object") {
        log.addToMaskedValues(modules[mod][s]);
        secretPaths.push(`${mod}/${s}`);
      }
    });
  });
  if (secretPaths.length > 0) {
    log.debug(
      `All secret values [ ${secretPaths.length} ] have been masked in logging`,
      {
        secretPaths
      }
    );
  } else {
    log.debug(
      `No secrets where added in this function's call; no additional log masking needed.`
    );
  }
}
