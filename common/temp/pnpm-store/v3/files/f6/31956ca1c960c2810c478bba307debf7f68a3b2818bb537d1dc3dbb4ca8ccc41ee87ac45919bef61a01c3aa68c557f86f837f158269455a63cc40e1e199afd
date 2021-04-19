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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = __importDefault(require("webpack"));
const index_1 = require("../../../shared/ast/index");
const path_1 = require("path");
/**
 * Transpiles all or _some_ of the handler functions
 * using **Webpack**
 */
function webpack(opts = {}) {
    const fns = opts.fns || index_1.getValidServerlessHandlers();
    delete opts.fns;
    return {
        build: build(fns, opts),
        watch: watch(fns, opts),
    };
}
exports.default = webpack;
function build(fns, opts) {
    return async function webpackBuild() {
        console.log("webpack build:", fns);
    };
}
function watch(fns, opts) {
    return async function webpackWatch() {
        const wpConfig = await Promise.resolve().then(() => __importStar(require(path_1.join(process.cwd(), "webpack.config.js"))));
        webpack_1.default(wpConfig).watch({}, function () {
            console.log("watcher");
        });
    };
}
