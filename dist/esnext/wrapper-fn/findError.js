/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 * If _not_ found then return `false`.
 */
export function findError(e, expectedErrors) {
    let found = false;
    expectedErrors.list.forEach(i => {
        if ((e.code && e.code === i.identifiedBy.code) ||
            (e.name && e.name == i.identifiedBy.name) ||
            (e.message && e.message.includes(i.identifiedBy.messageContains)) ||
            e instanceof i.identifiedBy.errorClass) {
            found = i;
        }
    });
    return found;
}
//# sourceMappingURL=findError.js.map