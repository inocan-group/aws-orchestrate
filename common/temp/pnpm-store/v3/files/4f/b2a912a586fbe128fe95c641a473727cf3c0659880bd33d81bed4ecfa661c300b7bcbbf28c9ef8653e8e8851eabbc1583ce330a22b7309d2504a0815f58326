"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exclusions = void 0;
/**
 * returns the explicitly excluded files/directory names that are stated on a given file
 */
function exclusions(file) {
    const hasExclusions = /^\/\/\s*#autoindex.*,\s*exclude:/;
    const explicit = hasExclusions.test(file)
        ? file
            .replace(/^\/\/\s*#autoindex.*,\s*exclude:([^;|\n]*)[\n|;][^\0]*/g, "$1")
            .split(",")
            .map((i) => i.trim())
        : [];
    return Array.from(new Set(explicit.concat(["index", "private"])));
}
exports.exclusions = exclusions;
