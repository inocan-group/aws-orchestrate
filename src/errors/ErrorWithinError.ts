import { HttpStatusCodes } from "common-types";
import get from "lodash.get";

/**
 * Errors which are encountered while handling an error. These secondary errors
 * should always originate from the **wrapper** function rather than the consumer's
 * _handler_ function.
 */
export class ErrorWithinError extends Error {
  /**
   * creates an error to be thrown by a **Lambda** function which
   * was initiatiated by a
   */

  /**
   * The `name` is of the format `type`/`sub-type`
   */
  name: string;
  /**
   * The `code` is the "sub-type" of the name
   */
  code: string;

  /** the HTTP errorCode */
  httpStatus: number;
  /** the AWS requestId */
  requestId: string;

  originalStack: string;

  constructor(
    /** the original error */
    originalError: Error,
    /** the error encountered within the error handling section */
    secondaryErr: Error
  ) {
    super(originalError.message);
    this.name = "aws-orchestrate/error-handling";
    this.code = "error-handling";
    this.httpStatus = HttpStatusCodes.InternalServerError;
    this.message = `There was an error in the wrapper function while TRYING to handle another error. The original error had a message of: \n"${get(
      originalError,
      "message",
      "no message"
    )}".\n\nSubsequently the error within the wrapper function was: "${get(
      secondaryErr,
      "message",
      "no message"
    )}"`;

    this.stack = secondaryErr.stack;
    this.originalStack = originalError.stack;
  }
}
