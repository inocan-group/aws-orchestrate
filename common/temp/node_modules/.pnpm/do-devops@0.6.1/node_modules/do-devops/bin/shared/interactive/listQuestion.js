"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuestion = void 0;
function listQuestion(q) {
    return {
        ...q,
        type: "list",
    };
}
exports.listQuestion = listQuestion;
