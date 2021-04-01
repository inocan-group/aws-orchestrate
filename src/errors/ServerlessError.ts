import { HttpStatusCodes } from "common-types";

export class ServerlessError extends Error {
  /**
   * Identifies the _kind_ of error message this is so that
   * the `wrapper` function will accept this error as a known
   * error and pass it through
   */
  name = "ServerlessError";

  /**
   * A string based `code` for the error which is useful/handy for consumers to potentially handle
   */
  code: string;

  /** the HTTP errorCode */
  httpStatus: HttpStatusCodes | number;

  /**
   * The type/sub-type of the error
   */
  classification: string;

  /**
   * The handler function' name
   */
  functionName: string;

  /** the AWS requestId */
  requestId: string;

  /**
   * the sequence's correlation ID
   */
  correlationId: string;
  /**
   * The specific AWS request ID used for this function's execution
   */
  awsRequestId: string;

  /**
   * **Constructor**
   *
   * @param errorCode the numeric HTTP error code
   * @param message a string description which describes the error
   * @param classification the type/subtype of the error; if only `subtype` stated then
   * type will be defaulted to the handler's name
   */
  constructor(errorCode: HttpStatusCodes | number, message: string, classification: string) {
    super(message);
    this.name = "ServerlessError";

    const parts = classification.split("/");
    const hasTypeDefined = parts.length > 1;
    this.classification = hasTypeDefined ? classification : `aws-orchestrate/${classification}`;
    this.code = this.classification.split("/")[1];
    this.httpStatus = errorCode;
  }
}
