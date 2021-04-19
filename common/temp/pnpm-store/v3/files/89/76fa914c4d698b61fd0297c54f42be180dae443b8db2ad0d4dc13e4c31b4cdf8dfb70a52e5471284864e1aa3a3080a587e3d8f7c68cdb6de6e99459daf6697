import { IDictionary } from "./IDictionary";
export declare type IPluralizeRuleEngine = (input: string, rule: RegExp, exceptions: string[]) => string;
export declare type IPluralizeRule = [
    pattern: RegExp,
    fn: IPluralizeRuleEngine,
    exceptions?: string[]
];
export declare type IExplicitPluralization = [singular: string, plural: string];
export interface IPluralizeOptions {
    /** you can manually put a string at the end and if done the default rules will not be run */
    postfix?: string;
    /** you can put in your own rules engine where you'd like */
    rules?: IPluralizeRuleEngine;
    /**
     * You can also extend or override the default "explicit rules" by sending in your
     * own dictionary mapping:
     *
     * ```ts
     * const explictPluralizations = {
     *    foo: 'foey',
     *    bar: 'barred',
     * }
     * const plural = pluralize(something, { explictPluralizations });
     * ```
     */
    explictPluralizations?: IDictionary<string>;
    additionalRules?: IPluralizeRule[];
    /**
     * By default an error is thrown when passed in an empty string but setting
     * this to `true` will pass back an empty string and just ignore.
     */
    ignoreEmptyStrings?: boolean;
}
/**
 * A simple and light weight pluralizer utility.
 */
export declare function pluralize(input: string, options?: IPluralizeOptions): string;
