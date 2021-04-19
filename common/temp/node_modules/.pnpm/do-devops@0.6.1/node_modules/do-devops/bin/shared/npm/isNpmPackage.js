"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNpmPackage = void 0;
const index_1 = require("./index");
async function isNpmPackage() {
    try {
        const npm = await index_1.getPackageInfo();
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isNpmPackage = isNpmPackage;
