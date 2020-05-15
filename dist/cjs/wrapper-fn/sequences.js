"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeNewSequence = exports.getNewSequence = exports.registerSequence = void 0;
const private_1 = require("../private");
let newSequence;
/**
 * Adds a new sequence to be invoked later (as a call to `invokeNewSequence`)
 */
function registerSequence(log, context) {
    return (s) => {
        log.debug(`This function has registered a new sequence with ${s.steps.length} steps to be kicked off as part of this function's execution.`, { sequence: s.toObject() });
        newSequence = s;
    };
}
exports.registerSequence = registerSequence;
/**
 * returns the sequence which was set by `startSequence()`
 **/
function getNewSequence() {
    return newSequence || private_1.LambdaSequence.notASequence();
}
exports.getNewSequence = getNewSequence;
async function invokeNewSequence(results = {}) {
    if (!newSequence) {
        return;
    }
    results = results || {};
    const response = await newSequence.start();
    return response;
}
exports.invokeNewSequence = invokeNewSequence;
//# sourceMappingURL=sequences.js.map