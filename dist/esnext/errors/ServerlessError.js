export class ServerlessError extends Error {
    /**
     * **Constructor**
     *
     * @param errorCode the numeric HTTP error code
     * @param message a string description which describes the error
     * @param classification the type/subtype of the error; if only `subtype` stated then
     * type will be defaulted to the handler's name
     */
    constructor(errorCode, message, classification) {
        super(message);
        /**
         * Identifies the _kind_ of error message this is so that
         * the `wrapper` function will accept this error as a known
         * error and pass it through
         */
        this.name = "ServerlessError";
        this.name = "ServerlessError";
        const parts = classification.split("/");
        const hasTypeDefined = parts.length > 1;
        this.classification = hasTypeDefined ? classification : `aws-orchestrate/${classification}`;
        this.code = this.classification.split("/")[1];
        this.httpStatus = errorCode;
    }
}
//# sourceMappingURL=ServerlessError.js.map