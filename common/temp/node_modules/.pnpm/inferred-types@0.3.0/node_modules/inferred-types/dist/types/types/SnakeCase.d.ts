import { Uncapitalize, DashToSnake } from "./index";
declare type Dash = "-";
/**
 * Converts a string literal type to _kebab-case_
 */
export declare type SnakeCase<S, T extends string = ""> = S extends `${infer HEAD}${Dash}${infer TAIL}` ? DashToSnake<S> : S extends `${infer First}${infer Rest}` ? First extends Uncapitalize<First> ? SnakeCase<Rest, `${T}${First}`> : T extends "" ? SnakeCase<Rest, `${Uncapitalize<First>}`> : SnakeCase<Rest, `${T}_${Uncapitalize<First>}`> : T;
export {};
