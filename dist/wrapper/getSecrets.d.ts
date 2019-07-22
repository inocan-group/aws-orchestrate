import { IDictionary } from "common-types";
export interface IGetSecrets<T> {
    (modules: string[], localLookup?: keyof T): IDictionary;
}
export declare function getSecrets<T>(event: T): (modules: string[], localLookup?: keyof T) => Promise<T[keyof T] | import("aws-ssm").ISsmExportsOutput<string>>;
