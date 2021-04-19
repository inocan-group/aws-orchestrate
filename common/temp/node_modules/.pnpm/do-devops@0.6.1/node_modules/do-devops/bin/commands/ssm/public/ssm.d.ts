import { IDictionary } from "common-types";
export interface ISubCommandHash {
    [cmd: string]: {
        execute: (argv: string[], opts: IDictionary) => Promise<void>;
    };
}
export declare function handler(argv: string[], ssmOptions: IDictionary): Promise<void>;
