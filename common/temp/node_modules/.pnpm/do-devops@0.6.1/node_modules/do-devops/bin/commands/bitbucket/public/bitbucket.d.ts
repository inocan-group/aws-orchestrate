import { IDictionary } from "common-types";
export interface IBitbucketHandler {
    handler: (opts: IDictionary) => Promise<0 | 1>;
}
export declare function handler(argv: string[], opts: IDictionary): Promise<void>;
