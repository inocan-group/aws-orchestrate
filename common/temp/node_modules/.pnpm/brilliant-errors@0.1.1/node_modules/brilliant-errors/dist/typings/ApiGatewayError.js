import { ErrorKind } from "./types";
//#endregion class-interfaces
/**
 * An Error thrown by a application which does _not_ require a numeric
 * HTTP error code on each throw. You may, however, include one where appropriate,
 * and you have the option when configuring the error to state a "default" HTTP code
 * (though no default will be provided unless you state it)
 */
export function createApiGatewayError(projectName, fnName, defaultOptions = {}) {
    // CLASS DEFINITION
    class ApiGatewayError extends Error {
        /**
         * **ApiGatewayError**
         *
         * @param errorCode the numeric HTTP code for this error
         * @param message a string-based, human friendly message
         * @param options a dictionary of params you _can_ but are _not required_ to set
         */
        constructor(errorCode, errorMessage, options = {}) {
            super(`[ ${projectName}.${fnName}() / ${String(errorCode)} ]: ${errorMessage}`);
            this.kind = ErrorKind.ApiGatewayError;
            this.projectName = projectName;
            this.fnName = fnName;
            const opts = { ...defaultOptions, ...options };
            this.code = opts.code || "error";
            this.classification = `${projectName}/${fnName}`;
            this.errorCode = errorCode;
            this.errorMessage = `[ ${projectName}.${fnName}() / ${String(errorCode)} ]: ${errorMessage}`;
        }
    }
    return ApiGatewayError;
}
