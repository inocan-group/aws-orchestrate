import { Lowercase, Capitalize } from "./Intrinsic";
declare type Delimiter = "_" | "-";
export declare type CamelCase<S extends string> = S extends `${infer B}${Delimiter}${infer A}${infer R}` ? `${Lowercase<B>}${Capitalize<A>}${CamelCase<R>}` : Lowercase<S>;
export {};
