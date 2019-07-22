import { IDictionary } from "common-types";

export interface IGetSecrets<T> {
  (modules: string[], localLookup?: keyof T): IDictionary;
}

/**
 * **getSecrets**
 *
 * gets the needed module secrets; using locally available information if available, otherwise
 * going out SSM to get.
 *
 * @param modules the modules which are have secrets that are needed for the functions execution.
 * @param localLookup the property to look for the secrets in the incoming event/request
 */
export function getSecrets<T>(event: T) {
  return async (modules: string[], localLookup?: keyof T) => {
    if (localLookup && event && event[localLookup]) {
      const localModules = Object.keys(event[localLookup]);
      if (localModules.every(i => modules.includes(i))) {
        return event[localLookup];
      }
    }
    const SSM = (await import("aws-ssm")).SSM;
    const secrets = await SSM.modules(modules);
    return secrets;
  };
}
