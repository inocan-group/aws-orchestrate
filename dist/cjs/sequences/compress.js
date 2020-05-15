"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompress = exports.isCompressedSection = exports.compress = void 0;
const lzutf8_1 = require("lzutf8");
const UnhandledError_1 = require("../errors/UnhandledError");
const common_types_1 = require("common-types");
/**
 * compresses large payloads larger than 4k (or whatever size
 * you state in the second parameter)
 */
function compress(data, ifLargerThan) {
    let payload;
    if (typeof data !== "string") {
        payload = JSON.stringify(data);
    }
    else {
        payload = data;
    }
    if (payload.length > (ifLargerThan || 4096)) {
        return {
            compressed: true,
            data: compressionHandler(payload)
        };
    }
    else {
        return data;
    }
}
exports.compress = compress;
function compressionHandler(data) {
    try {
        return lzutf8_1.compress(data, { inputEncoding: "String", outputEncoding: "Base64" });
    }
    catch (e) {
        e.message = `Problem compressing section. Error message: ${e.message}\n\nText being compressed started with: ${data.slice(0, 10)}`;
        throw new UnhandledError_1.UnhandledError(common_types_1.HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
    }
}
function isCompressedSection(data) {
    return typeof data === "object" &&
        data.compressed === true
        ? true
        : false;
}
exports.isCompressedSection = isCompressedSection;
function decompress(data, parse = true) {
    const parser = parse ? JSON.parse : (a) => a;
    return isCompressedSection(data)
        ? parser(decompressionHandler(data))
        : data;
}
exports.decompress = decompress;
function decompressionHandler(section) {
    try {
        return lzutf8_1.decompress(section.data, {
            inputEncoding: "Base64",
            outputEncoding: "String"
        });
    }
    catch (e) {
        e.message = `Problem decompressing section. Error message: ${e.message}\n\nText being decompressed started with: ${section.data.slice(0, 10)}`;
        throw new UnhandledError_1.UnhandledError(common_types_1.HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
    }
}
//# sourceMappingURL=compress.js.map