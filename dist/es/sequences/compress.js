import { compress as c, decompress as d } from "lzutf8";
import { UnhandledError } from "../errors/UnhandledError";
import { HttpStatusCodes } from "common-types";
/**
 * compresses large payloads larger than 4k (or whatever size
 * you state in the second parameter)
 */
export function compress(data, ifLargerThan) {
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
function compressionHandler(data) {
    try {
        return c(data, { inputEncoding: "String", outputEncoding: "Base64" });
    }
    catch (e) {
        e.message = `Problem compressing section. Error message: ${e.message}\n\nText being compressed started with: ${data.slice(0, 10)}`;
        throw new UnhandledError(HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
    }
}
export function isCompressedSection(data) {
    return typeof data === "object" &&
        data.compressed === true
        ? true
        : false;
}
export function decompress(data, parse = true) {
    const parser = parse ? JSON.parse : (a) => a;
    return isCompressedSection(data)
        ? parser(decompressionHandler(data))
        : data;
}
function decompressionHandler(section) {
    try {
        return d(section.data, {
            inputEncoding: "Base64",
            outputEncoding: "String"
        });
    }
    catch (e) {
        e.message = `Problem decompressing section. Error message: ${e.message}\n\nText being decompressed started with: ${section.data.slice(0, 10)}`;
        throw new UnhandledError(HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
    }
}
//# sourceMappingURL=compress.js.map