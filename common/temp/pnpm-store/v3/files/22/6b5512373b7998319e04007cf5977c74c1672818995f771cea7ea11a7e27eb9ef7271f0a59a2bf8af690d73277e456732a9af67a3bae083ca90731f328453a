'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function atRandom(things, excluding = []) {
    things = things.filter((i) => typeof excluding === "function" ? excluding(i) : !excluding.includes(i));
    const random = Math.floor(Math.random() * things.length);
    return things[random];
}

function between(start, end) {
    const diff = Math.abs(end - start) + 1;
    const random = Math.floor(Math.random() * diff);
    return start + random;
}

/**
 * Capitalizes the first character of the string passed in
 */
function capitalize(input) {
    if (typeof input !== "string") {
        throw new Error(`Failed to capitalize "${input}" as it was not of type "string" [${typeof input}]`);
    }
    return input.slice(0, 1).toUpperCase() + input.slice(1);
}

/**
 * **Pascalize**
 *
 * converts string representations in camelCase, snake_case, or space separated
 * into a PascalCase representation.
 *
 * Note: _by default it also removes surrounding white space (if it exists) but it
 * can be preserved if you change the `preserveWhitespace` flag._
 */
function pascalize(input, preserveWhitespace = false) {
    const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(input);
    const convertInteriorToCap = (i) => i.replace(/[ |_|-]+([0-9]*?[a-z|A-Z]{1})/gs, (_, p1) => p1.toUpperCase());
    const startingToCap = (i) => i.replace(/^[_|-]*?([0-9]*?[a-z]{1})/gs, (_, p1) => p1.toUpperCase());
    const replaceLeadingTrash = (i) => i.replace(/^[-_]/s, "");
    const replaceTrailingTrash = (i) => i.replace(/[-_]$/s, "");
    return `${preserveWhitespace ? preWhite : ""}${capitalize(replaceTrailingTrash(replaceLeadingTrash(convertInteriorToCap(startingToCap(focus)))))}${preserveWhitespace ? postWhite : ""}`;
}

/**
 * **Camelize**
 *
 * converts a string into _camelCase_.
 *
 * Note: _by default it also removes surrounding white space (if it exists) but it
 * can be preserved if you change the `preserveWhitespace` flag._
 */
function camelize(input, preserveWhitespace = false) {
    const pascal = pascalize(input, preserveWhitespace);
    const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(pascal);
    return ((preserveWhitespace ? preWhite : "") +
        focus.replace(/^.*?([0-9]*?[a-z|A-Z]{1})/s, (_, p1) => p1.toLowerCase()) +
        (preserveWhitespace ? postWhite : ""));
}

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
function dasherize(input) {
    const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(input);
    const replaceWhitespace = (i) => i.replace(/\s/gs, "-");
    const replaceUppercase = (i) => i.replace(/[A-Z]/g, (c) => `-${c[0].toLowerCase()}`);
    const replaceLeadingDash = (i) => i.replace(/^-/s, "");
    const replaceTrailingDash = (i) => i.replace(/-$/s, "");
    const replaceUnderscore = (i) => i.replace(/_/g, "-");
    const removeDupDashes = (i) => i.replace(/-+/g, "-");
    return `${preWhite}${replaceUnderscore(replaceTrailingDash(replaceLeadingDash(removeDupDashes(replaceWhitespace(replaceUppercase(focus))))))}${postWhite}`;
}

function deserialize(arr) {
    return arr.split("\n").map((i) => JSON.parse(i));
}

/**
 * **first**
 *
 * returns the first item in an array
 */
function first(arr) {
    return arr.slice(0, 1);
}

/**
 * **firstKey**
 *
 * returns the _first_ key in a dictionary
 */
function firstKey(dict) {
    return Object.keys(dict).slice(0, 1).pop();
}

/**
 * **flatten**
 *
 * > If you know that your run-time supports using the native `[ ].flat()` language feature
 * (which all modern node runtimes and browsers largely outside of IE11 do then you should
 * use this instead).
 */
function flatten(arr) {
    return arr.flat ? arr.flat() : arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * **get**
 *
 * Gets a value in a deeply nested object. This is a replacement to `lodash.get`
 *
 * @param obj the base object to get the value from
 * @param dotPath the path to the object, using "." as a delimiter
 * @param defaultValue optionally you may state a default value if the operation results in `undefined`
 */
function get(obj, dotPath, defaultValue) {
    const parts = dotPath.split(".");
    let value = obj;
    parts.forEach((p) => {
        value = typeof value === "object" && Object.keys(value).includes(p) ? value[p] : undefined;
    });
    return value ? value : defaultValue;
}

/**
 * Provides a dependency-free method of generating
 * a useful 4 character random string.
 *
 * > **Note:** if you want a GUID then use the `guid()`
 * function instead which leverages this function but
 * puts it into the proper GUID format
 */
function randomString() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

/**
 * Produces a UUID with 32 random string characters.
 *
 * By default this will use the dasherized convention of **uuid** but you can
 * turn this off and just output the random string characters.
 */
function uuid(dasherized = true) {
    return dasherized
        ? randomString() +
            randomString() +
            "-" +
            randomString() +
            "-" +
            randomString() +
            "-" +
            randomString() +
            "-" +
            randomString() +
            randomString() +
            randomString()
        : randomString() +
            randomString() +
            randomString() +
            randomString() +
            randomString() +
            randomString() +
            randomString() +
            randomString();
}

/**
 * Produces a dasherized random ID
 *
 * @deprecated please use `uuid` instead
 */
function guid() {
    return uuid();
}

/**
 * Provides a hashing function which produces a 32-bit integer
 * hash which provides idempotency.
 *
 * This function is not intended to be used in situations where
 * there is need for strong cryptographic assurances but rather
 * where a _very_ lightweight hasher is desired.
 *
 * For more information on this hash function refer to the discussion
 * on stackoverflow: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 *
 * @param digest the text digest to be hashed
 */
function hash(digest) {
    let hash = 0, i, chr;
    for (i = 0; i < digest.length; i++) {
        chr = digest.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

/**
 * Tests whether the passed in year is a leap year or not
 */
function isLeapYear(year) {
    const y = typeof year === "number" ? year : year.getFullYear();
    return new Date(y, 1, 29).getDate() === 29;
}

/**
 * Tests whether the passed in string is a valid GUID. Valid GUID's
 * must be of the format. This is typically expressed in a **RegExp** as:
 *
 * ```ts
 * /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/
 * ```
 *
 * However, the dashes are not a strict requirement, so you may choose to validate
 * using both the above format and the non-dasherized version. Default behavior is _not_
 * to allow the non-dasherized form.
 */
function isUuid(candidate, allowNonDashedForm) {
    const dasherizedGuid = /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/;
    const plainGuid = /^(\{{0,1}([0-9a-fA-F]){32}\}{0,1})$/;
    return allowNonDashedForm === true
        ? plainGuid.test(candidate) || dasherizedGuid.test(candidate)
        : dasherizedGuid.test(candidate);
}

/**
 * **last**
 *
 * returns the last item in an array
 */
function last(arr) {
    return arr.slice(-1);
}

/**
 * **lastKey**
 *
 * returns the _last_ key in a dictionary
 */
function lastKey(dict) {
    return Object.keys(dict).slice(-1).pop();
}

/**
 * Joins a set of paths together into a single path.
 *
 * **Note:** trailing path never includes a `/` so add this at the end if
 * you need it.
 *
 * **Note:** the ".." characters are allowed in starting string but in no
 * other.
 *
 * **Note:** any use of the Windows "\\" will be converted to the Posix "/"
 */
function pathJoin(...args) {
    const leadingSlash = args[0] && (args[0].startsWith("/") || args[0].startsWith("\\"));
    const parts = args
        .filter((i) => i)
        .map((i) => removeSlashAtFrontAndBack(makeForwardSlashBeBackward(i)));
    if (parts.slice(1).some((i) => i.includes(".."))) {
        throw new Error(`pathJoin() only accepts the ".." notation at the beginning of the first string and no where else. Input was invalid: ${JSON.stringify(args)}`);
    }
    return `${leadingSlash ? "/" : ""}${parts.join("/")}`;
}
function removeSlashAtFrontAndBack(input) {
    input = input.startsWith("/") ? input.slice(1) : input;
    input = input.endsWith("/") ? input.slice(0, input.length - 1) : input;
    return input;
}
function makeForwardSlashBeBackward(input) {
    return input.replace(/\\/gs, "/");
}

/** Rules were derived from [Grammarly](https://www.grammarly.com/blog/plural-nouns/) */
const defaultRules = [
    // ending in "us"
    [/(us)$/, (i) => `${i.replace(/us$/, "")}i`, ["bus", "us"]],
    // "is" to "es"
    [/(is)$/, (i, r) => `${i.replace(r, "")}es`],
    // singular noun endings that have "es" added
    [/(s|sh|ch|x|z|o)$/, (i) => `${i}es`],
    // ending in "f" or "fe"
    [/fe{0,1}$/, (i, r) => `${i.replace(r, "")}ves`],
    // end in Y, with consonant before it
    [
        /[b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|z|y]y$/,
        (i) => `${i.slice(0, i.length - 1)}ies`,
    ],
];
var Rule;
(function (Rule) {
    Rule[Rule["regex"] = 0] = "regex";
    Rule[Rule["fn"] = 1] = "fn";
    Rule[Rule["exceptions"] = 2] = "exceptions";
})(Rule || (Rule = {}));
var ExplicitRule;
(function (ExplicitRule) {
    ExplicitRule[ExplicitRule["singular"] = 0] = "singular";
    ExplicitRule[ExplicitRule["plural"] = 1] = "plural";
})(ExplicitRule || (ExplicitRule = {}));
/**
 * A simple and light weight pluralizer utility.
 */
function pluralize(input, options = {}) {
    if (input === "") {
        if (options.ignoreEmptyStrings)
            return "";
        throw new Error("Attempt to pluralize an empty string");
    }
    const defaultExceptions = {
        photo: "photos",
        piano: "pianos",
        halo: "halos",
        foot: "feet",
        man: "men",
        woman: "women",
        person: "people",
        mouse: "mice",
        series: "series",
        sheep: "sheep",
        deer: "deer",
    };
    const exceptions = {
        ...defaultExceptions,
        ...(options.explictPluralizations ? options.explictPluralizations : {}),
    };
    if (Object.keys(exceptions).includes(input)) {
        return exceptions[input];
    }
    const pRules = options.rules || options.additionalRules
        ? defaultRules.concat(...options.additionalRules)
        : defaultRules;
    const rules = pRules.filter((r) => r[Rule.regex].test(input) && !(r[Rule.exceptions] || []).includes(input));
    if (rules.length > 0) {
        const [r, fn, exceptions] = rules[0];
        return fn(input, r, exceptions || []);
    }
    else {
        return `${input}s`;
    }
}

// import type { Request} from  'node-fetch'
// export type url = [url: string, fetch: typeof fetch];
// export type filename = string;
/**
 * converts an array of _things_ into a `\n` delimited
 * string of stringified objects.
 *
 * FUTURE: If a **source** is passed in
 * -- either a _file_ or _url_ then it will stream to that
 * source.
 *
 */
function serialize(arr /** , source?: url | filename **/) {
    return arr.map((i) => JSON.stringify(i)).join("\n");
}

/**
 * Sets a value at a nested point within base object passed in. This is meant as a
 * replacement to use of `lodash.set()`.
 *
 * @param obj the base object which is being mutated
 * @param dotPath the path into the object where the mutation will take place, delimited by `.`
 * @param value The value to set at the _dotPath_
 * @param createIfNonExistant by default, if the path to the object does not exist then an error is thrown but if you want you can state the desire to have the full path created
 */
function set(obj, dotPath, value, createIfNonExistant = true) {
    if (!dotPath) {
        throw new Error(`Attempt to set value into a dotPath but the dotPath was empty!`);
    }
    const parts = dotPath.split(/\??\./);
    const allButLast = parts.slice(0, parts.length - 1);
    const key = parts.pop();
    let ref = obj;
    // iterate the ref to the leaf node
    allButLast.forEach((p) => {
        if (!ref[p]) {
            if (createIfNonExistant) {
                ref[p] = {};
            }
            else {
                throw new Error(`The dotPath -- ${dotPath} -- does not exist in the passed in object. You must either expressly state that you want the object structure created or this a real error that must be addressed otherwise. The part of the path which this failed on was "${p}".`);
            }
        }
        else if (typeof ref[p] !== "object") {
            throw new Error(`Failed to set the path of "${dotPath}" of the passed in base object because the base object had a scalar value along that path and setting this would have changed the object's data structure in way which is not allowed! The scalar value was found in the "${p}" component of the path.`);
        }
        ref = ref[p];
    });
    ref[key] = value;
}

/**
 * **Snakerize**
 *
 * Converts a string to snake_case notation.
 *
 * Note: _by default it also removes surrounding white space (if it exists) but it
 * can be preserved if you change the `preserveWhitespace` flag._
 */
function snakerize(input, preserveWhitespace = false) {
    const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(input);
    const convertInteriorSpace = (input) => input.replace(/\s+/gs, "_");
    const convertDashes = (input) => input.replace(/-/gs, "_");
    const injectUnderscoreBeforeCaps = (input) => input.replace(/([A-Z])/gs, "_$1");
    const removeLeadingUnderscore = (input) => input.startsWith("_") ? input.slice(1) : input;
    return ((preserveWhitespace ? preWhite : "") +
        removeLeadingUnderscore(injectUnderscoreBeforeCaps(convertDashes(convertInteriorSpace(focus)))).toLowerCase() +
        (preserveWhitespace ? postWhite : ""));
}

/**
 * Provides the unique values for a given property in an array of
 * commonly typed objects.
 *
 * @param list the list of objects
 * @param property the property to evaluate
 */
function unique(list, property) {
    return Array.from(new Set(list.map((i) => i[property])));
}

const RESET_FG = `\u001b[39m`;
const RESET_BG = `\u001b[49m`;
/**
 * A dictionary of colors; first value is foreground,
 * second is background.
 */
const COLOR = {
    black: [30, 40],
    red: [31, 41],
    magenta: [35, 45],
    yellow: [33, 43],
    green: [32, 42],
    brightRed: [91, 40],
    brightGreen: [92, 42],
    brightYellow: [93, 43],
};

function paint(text = "", fg, bg) {
    const foreground = "\u001b[" + fg(COLOR)[0] + "m";
    const bgc = bg ? bg(COLOR)[1] : null;
    const background = bgc ? "\u001b[" + bgc + "m" : "";
    const reset = background ? `${RESET_FG}${RESET_BG}` : `${RESET_FG}`;
    return `${RESET_FG}${foreground}${background}${text}${reset}`;
}

/** _italicize_ a block of text */
function italicize(text = "") {
    return `\u001b[3m${text}\u001b[0m`;
}
/** _underline_ a block of text */
function underline(text = "") {
    return `\u001b[4m${text}\u001b[0m`;
}
/** ~strikethrough~ a block of text (not supported on many terminals) */
function strikethrough(text = "") {
    return `\u001b[9m${text}\u001b[0m`;
}
/**
 * Look through a _corpus_ of text for a particular string and
 * then format for the console.
 */
// export function format(find: string, global: boolean = true) {
//   let config: IFormattingOptions = {};
//   return formattingApi<"in">(find, global, config);
// }

/**
 * Colorize text in the console.
 *
 * Choose a foreground color and optionally a background color.
 */
const color = {
    red: (text = "", bg) => {
        return paint(text, (c) => c.red, bg);
    },
    magenta: (text = "", bg) => {
        return paint(text, (c) => c.magenta, bg);
    },
    black: (text = "", bg) => {
        return paint(text, (c) => c.black, bg);
    },
    yellow: (text = "", bg) => {
        return paint(text, (c) => c.yellow, bg);
    },
    green: (text = "", bg) => {
        return paint(text, (c) => c.green, bg);
    },
    brightRed: (text = "", bg) => {
        return paint(text, (c) => c.brightRed, bg);
    },
};

exports.atRandom = atRandom;
exports.between = between;
exports.camelize = camelize;
exports.capitalize = capitalize;
exports.color = color;
exports.dasherize = dasherize;
exports.deserialize = deserialize;
exports.first = first;
exports.firstKey = firstKey;
exports.flatten = flatten;
exports.get = get;
exports.guid = guid;
exports.hash = hash;
exports.isLeapYear = isLeapYear;
exports.isUuid = isUuid;
exports.italicize = italicize;
exports.last = last;
exports.lastKey = lastKey;
exports.pascalize = pascalize;
exports.pathJoin = pathJoin;
exports.pluralize = pluralize;
exports.randomString = randomString;
exports.serialize = serialize;
exports.set = set;
exports.snakerize = snakerize;
exports.strikethrough = strikethrough;
exports.underline = underline;
exports.unique = unique;
exports.uuid = uuid;
