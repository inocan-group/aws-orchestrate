"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectExportType = void 0;
const index_1 = require("../index");
function detectExportType(fileContent) {
    const defaultExport = /^\/\/\s*#autoindex:\s*default/;
    const namedOffsetExport = /^\/\/\s*#autoindex:\s*named\-offset/;
    const offsetExport = /^\/\/\s*#autoindex:\s*offset/;
    if (defaultExport.test(fileContent)) {
        return index_1.ExportType.default;
    }
    if (namedOffsetExport.test(fileContent) || offsetExport.test(fileContent)) {
        return index_1.ExportType.namedOffset;
    }
    return index_1.ExportType.named;
}
exports.detectExportType = detectExportType;
