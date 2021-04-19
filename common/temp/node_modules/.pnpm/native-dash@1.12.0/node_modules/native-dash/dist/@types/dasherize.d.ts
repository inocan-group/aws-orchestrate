/**
 * Produces a _dasherized_ version of a passed in string by:
 *
 * 1. Replacing all interior whitespace with a dash
 * 2. Replacing capitalized letters with a dash followed by the lowercase variant.
 * 3. Replace underscores with dashes
 * 4. Ensuring that duplicate dashes are removed and that non-whitespaced
 * characters are not dashes
 *
 * Note: does not impact exterior whitespace, e.g., `  myDash  ` is translated to `  my-dash  ` and leading and closing white space is not transformed.
 */
export declare function dasherize(input: string): string;
