export declare type sql = string;
export declare type NumericCharacter = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
/**
 * A string representation of the common Type/SubType classification.
 */
export declare type TypeSubtype = `${string}/${string}`;
/**
 * A type guard to check that a string is of the type `TypeSubtype`
 */
export declare function isTypeSubtype(str: string): str is TypeSubtype;
/**
 * Stages of development.
 *
 * Starting with "local" which is intended for local-only environment.
 * After that each stage typically indicates a _server_ based
 * environment your code should point to.
 */
export declare type DevelopmentStage = "local" | "dev" | "prod" | "test" | "stage";
