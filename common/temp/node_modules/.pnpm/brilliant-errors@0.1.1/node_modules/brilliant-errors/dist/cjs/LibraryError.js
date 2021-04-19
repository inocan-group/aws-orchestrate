"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLibraryError = void 0;
const types_1 = require("./types");
//#endregion class-interfaces
function createLibraryError(
/**
 * The library's name
 */
library, 
/**
 * Default options
 */
defaultOptions = {}) {
    /**
     * An Error thrown by library code which does _not_ require a numeric
     * HTTP error code on each throw. You may, however, include one where appropriate,
     * and you have the option when configuring the error to state a "default" HTTP code
     * (though no default will be provided unless you state it)
     *
     * Unlike, `AppError`'s, the `LibraryError` _does_ require that a string based code be
     * included (versus being defaulted to 'error'). This ensures that consumers of the library
     * can build conditional logic off of a reasonable
     */
    class LibraryError extends Error {
        /**
         *
         * @param message a string-based, human friendly message to present to the user; because this is considered an `AppError` the name of the application -- in brackets -- will be prefixed
         * to the text included here in the message
         * @param code A string-based classification of the error; this aligns with the
         * latest versions of Node which has a string based "code". This code will _also_
         * be included as part of the `classification` property
         * @param options a dictionary of params you _can_ but are _not required_ to set
         */
        constructor(message, code, options = {}) {
            super(`[ ${library} ]: ${message}`);
            this.kind = types_1.ErrorKind.LibraryError;
            this.library = library;
            const opts = { ...defaultOptions, ...options };
            this.code = code;
            this.classification = `${library}/${code}`;
            if (opts.errorCode) {
                this.errorCode = opts.errorCode;
            }
        }
    }
    return LibraryError;
}
exports.createLibraryError = createLibraryError;
