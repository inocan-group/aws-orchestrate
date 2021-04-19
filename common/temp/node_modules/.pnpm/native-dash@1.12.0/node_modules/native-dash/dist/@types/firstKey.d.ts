import { IDictionary } from "./IDictionary";
/**
 * **firstKey**
 *
 * returns the _first_ key in a dictionary
 */
export declare function firstKey(dict: IDictionary): undefined | (string & keyof typeof dict);
