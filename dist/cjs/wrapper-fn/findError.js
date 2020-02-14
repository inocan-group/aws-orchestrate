"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 * If _not_ found then return `false`.
 */
function findError(e, expectedErrors) {
    let found = false;
    expectedErrors.list.forEach(i => {
        if (e.code === i.identifiedBy.code ||
            e.name == i.identifiedBy.name ||
            e.message.includes(i.identifiedBy.messageContains) ||
            e instanceof i.identifiedBy.errorClass) {
            found = i;
        }
    });
    return found;
}
exports.findError = findError;
//# sourceMappingURL=findError.js.map