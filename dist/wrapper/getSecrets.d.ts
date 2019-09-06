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
export declare function getSecrets<T>(event: T): (modules: string[], localLookup?: keyof T) => Promise<T[keyof T] | import("aws-ssm").ISsmExportsOutput<string>>;
