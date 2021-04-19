"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetaInfo = void 0;
const removeExtension_1 = require("./removeExtension");
function createMetaInfo(exportType, sym, exclusions, opts) {
    const output = [];
    output.push(`// export: ${exportType}; exclusions: ${exclusions.join(", ")}.`);
    if (sym.files.length > 0) {
        output.push(`// files: ${sym.files.map((i) => removeExtension_1.removeExtension(i)).join(", ")}.`);
    }
    if (sym.dirs.length > 0) {
        output.push(`// directories: ${sym.dirs.join(", ")}.`);
    }
    if (opts.sfc && sym.sfcs.length > 0) {
        output.push(`// SFCs: ${sym.sfcs.map((i) => removeExtension_1.removeExtension(i)).join(", ")}.`);
    }
    return output.join("\n");
}
exports.createMetaInfo = createMetaInfo;
