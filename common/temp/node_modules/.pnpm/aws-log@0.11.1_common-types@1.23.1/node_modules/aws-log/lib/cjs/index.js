"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStage = exports.getState = exports.getContext = exports.getCorrelationId = void 0;
__exportStar(require("./logger"), exports);
__exportStar(require("./types"), exports);
var state_1 = require("./logger/state");
Object.defineProperty(exports, "getCorrelationId", { enumerable: true, get: function () { return state_1.getCorrelationId; } });
Object.defineProperty(exports, "getContext", { enumerable: true, get: function () { return state_1.getContext; } });
Object.defineProperty(exports, "getState", { enumerable: true, get: function () { return state_1.getState; } });
Object.defineProperty(exports, "getStage", { enumerable: true, get: function () { return state_1.getStage; } });
__exportStar(require("./logger/logging-api"), exports);
