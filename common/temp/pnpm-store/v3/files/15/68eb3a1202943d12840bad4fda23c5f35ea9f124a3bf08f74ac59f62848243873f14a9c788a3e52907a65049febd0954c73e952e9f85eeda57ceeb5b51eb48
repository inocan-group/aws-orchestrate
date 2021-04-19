"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppError = void 0;
const index_1 = require("./index");
//#endregion class-interfaces
/**
 * An Error thrown by a application. A string based "code" for the error can be added to errors
 * when throwing but isn't strictly required.
 */
function createAppError(appName, defaultOptions = {}) {
    // CLASS DEFINITION
    class AppError extends Error {
        /**
         *
         * @param message a string-based, human friendly message to present to the user; because this is considered an `AppError` the name of the application -- in brackets -- will be prefixed
         * to the text included here in the message
         * @param code A string-based classification of the error; this aligns with the
         * latest versions of Node which has a string based "code". This code will _also_
         * be included as part of the `classification` property
         * @param options a dictionary of params you _can_ but are _not required_ to set
         */
        constructor(message, code = "error", options = {}) {
            super(`[ ${appName} ]: ${message}`);
            this.kind = index_1.ErrorKind.AppError;
            this.app = appName;
            const opts = { ...defaultOptions, ...options };
            this.code = code;
            this.classification = `${appName}/${code}`;
            if (opts.errorCode) {
                this.errorCode = opts.errorCode;
            }
        }
    }
    return AppError;
}
exports.createAppError = createAppError;
