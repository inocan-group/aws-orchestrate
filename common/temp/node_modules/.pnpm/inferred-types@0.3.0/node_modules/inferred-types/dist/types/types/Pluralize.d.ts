declare type Consonant = "b" | "c" | "d" | "f" | "g" | "h" | "j" | "k" | "l" | "m" | "n" | "p" | "q" | "r" | "s" | "t" | "v" | "w" | "x" | "z" | "y";
declare type Exceptions = "photo => photos" | "piano => pianos" | "halo => halos" | "foot => feet" | "man => men" | "woman => women" | "person => people" | "mouse => mice" | "series => series" | "sheep => sheep" | "money => monies" | "deer => deer";
declare type SingularException<T = Exceptions> = T extends `${infer SINGULAR} => ${infer PLURAL}` ? SINGULAR : never;
declare type PluralException<T extends SingularException, E extends Exceptions = Exceptions> = E extends `${T} => ${infer PLURAL}` ? PLURAL : never;
declare type SingularNoun = "s" | "sh" | "ch" | "x" | "z" | "o";
declare type F = "f" | "fe";
declare type Y = `${Consonant}y`;
declare type RemoveTrailingY<T> = T extends `${infer HEAD}y` ? HEAD : T;
/** validates that a word ends with a pluralization exception */
declare type isException<T extends string> = T extends SingularException ? T : never;
/** validates that a string literal ends in "is" */
declare type EndsIn_IS<T extends string> = T extends `${infer HEAD}is` ? T : never;
/** validates that a string literal is a singular noun */
declare type EndsInSingularNoun<T extends string> = T extends `${infer HEAD}${SingularNoun}` ? T : never;
/** validates that a string literal ends in "f" or "fe" */
declare type EndsIn_F<T extends string> = T extends `${infer HEAD}${F}` ? T : never;
/** validates that a string literal ends a consonant followed by "y" */
declare type EndsIn_Y<T extends string> = T extends `${infer HEAD}${Y}` ? T : never;
/**
 * strings which end in the letters "is" should have an "es" added to the end
 */
declare type PluralizeEndingIn_IS<T extends string> = T extends `${infer HEAD}is` ? `${HEAD}ises` : T;
/**
 * singular nouns should have "es" added to the end
 */
declare type PluralizeEndingSingularNoun<T extends string> = T extends `${infer HEAD}${SingularNoun}` ? `${T}es` : T;
/**
 * strings which end in the letters "f" or "fe" should have "ves" replace the ending
 */
declare type PluralizeEnding_F<T extends string> = T extends `${infer HEAD}${F}` ? `${HEAD}ves` : T;
/**
 * singular nouns should have "es" added to the end
 */
declare type PluralizeEndingIn_Y<T extends string> = T extends `${infer HEAD}${Y}` ? `${RemoveTrailingY<T>}ies` : T;
export declare type Pluralize<T extends string> = T extends isException<T> ? PluralException<T> : T extends EndsIn_IS<T> ? PluralizeEndingIn_IS<T> : T extends EndsInSingularNoun<T> ? PluralizeEndingSingularNoun<T> : T extends EndsIn_F<T> ? PluralizeEnding_F<T> : T extends EndsIn_Y<T> ? PluralizeEndingIn_Y<T> : `${T}s`;
export {};
