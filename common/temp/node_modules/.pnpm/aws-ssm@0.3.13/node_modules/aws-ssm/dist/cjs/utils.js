"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addModuleName = exports.convertDictionaryToArray = exports.getSpecificVersion = exports.getLatestVersion = exports.findPriorDescription = exports.coerceValueToString = void 0;
function coerceValueToString(value) {
    if (typeof value === "object") {
        return JSON.stringify(value);
    }
    if (typeof value === "number") {
        return `NUMBER(${value})`;
    }
    if (typeof value === "boolean") {
        return value === true ? "__TRUE__" : "__FALSE__";
    }
    return value;
}
exports.coerceValueToString = coerceValueToString;
function findPriorDescription(Name) {
    return "";
}
exports.findPriorDescription = findPriorDescription;
function getLatestVersion(modules, verbose = false) {
    if (!modules) {
        return {};
    }
    const versions = Object.keys(modules).sort((a, b) => {
        return Number(a) - Number(b);
    });
    const moduleScope = modules[versions[0]];
    return verbose
        ? moduleScope
        : Object.keys(moduleScope).reduce((prev, curr) => {
            const ssmVariable = moduleScope[curr];
            prev[curr] = ssmVariable.Value;
            return prev;
        }, {});
}
exports.getLatestVersion = getLatestVersion;
function getSpecificVersion(modules, version, verbose = false) {
    if (!modules) {
        return {};
    }
    const versions = Object.keys(modules).sort((a, b) => {
        return Number(a) - Number(b);
    });
    if (!modules[String(version)]) {
        const err = new Error(`Version ${version} not found`);
        err.name = "VersionNotFound";
        throw err;
    }
    const moduleScope = modules[versions[version]];
    return verbose
        ? moduleScope
        : Object.keys(moduleScope).reduce((prev, curr) => {
            const ssmVariable = moduleScope[curr];
            prev[curr] = ssmVariable.Value;
            return prev;
        }, {});
}
exports.getSpecificVersion = getSpecificVersion;
function convertDictionaryToArray(params) {
    return Object.keys(params).reduce((prev, curr) => {
        return prev.concat(Object.assign(Object.assign({}, params[curr]), { variable: curr }));
    }, []);
}
exports.convertDictionaryToArray = convertDictionaryToArray;
function addModuleName(module, params, verbose = false) {
    return Object.keys(params).reduce((prev, key) => {
        prev[key] = verbose ? Object.assign(Object.assign({}, params[key]), { module }) : params[key];
        return prev;
    }, {});
}
exports.addModuleName = addModuleName;
//# sourceMappingURL=utils.js.map