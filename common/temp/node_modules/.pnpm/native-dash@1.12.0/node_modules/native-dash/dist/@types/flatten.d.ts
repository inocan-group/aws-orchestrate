/**
 * **flatten**
 *
 * > If you know that your run-time supports using the native `[ ].flat()` language feature
 * (which all modern node runtimes and browsers largely outside of IE11 do then you should
 * use this instead).
 */
export declare function flatten<T = any>(arr: T[]): T[] | (T extends readonly (infer InnerArr)[] ? InnerArr : T)[];
