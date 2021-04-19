import { CamelCase } from "./CamelCase";
import { Capitalize } from "./Intrinsic";
declare type Delimiter = "_" | "-";
/** Converts a string literal type to a **PascalCase** representation */
export declare type PascalCase<T extends string> = T extends `${infer Head}${Delimiter}${infer Tail}` ? Capitalize<CamelCase<T>> : Capitalize<T>;
export {};
