"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findHandlerComments = void 0;
const index_1 = require("./index");
const recast = __importStar(require("recast"));
const types = recast.types.namedTypes;
const builders = recast.types.builders;
/**
 * Given a file, it will look for the `handler` export
 * and return the comments associated with it. Alternatively
 * it will also look for comments associated with the `fn`
 * export.
 */
function findHandlerComments(filename) {
    const ast = index_1.parseFile(filename);
    const fn = index_1.namedExports(ast).find(i => i.name === "fn");
    const fnComments = fn ? fn.comments.filter(i => i.leading) : [];
    const handler = index_1.namedExports(ast).find(i => i.name === "handler");
    const handlerComments = handler
        ? handler.comments.filter(i => i.leading)
        : [];
    return fnComments.length > 0
        ? fnComments
        : handlerComments.length > 0
            ? handlerComments
            : [];
}
exports.findHandlerComments = findHandlerComments;
