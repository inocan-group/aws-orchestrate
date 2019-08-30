export class UnhandledError extends Error {
  /**
   * Create a serialized/string representation of the error
   * for returning to **API Gateway**
   */
  public static apiGatewayError(
    errorCode: number,
    e: Error,
    requestId: string,
    classification?: string
  ) {
    const obj = new UnhandledError(errorCode, e, classification);
    obj.requestId = requestId;
    return {
      statusCode: obj.httpStatus,
      errorType: obj.name,
      errorMessage: obj.message,
      stackTrace: obj.stack,
      body: JSON.stringify({
        requestId: obj.requestId,
        classification
      })
    };
  }

  /**
   * creates an error to be thrown by a **Lambda** function which
   * was initiatiated by a
   */
  public static lambdaError(
    errorCode: number,
    e: Error,
    classification?: string
  ) {
    const obj = new UnhandledError(errorCode, e, classification);
  }

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

  /**
   * **Constructor**
   *
   * @param errorCode the numeric HTTP error code
   * @param e the error which wasn't handled
   * @param classification the type/subtype of the error; if only `subtype` stated then
   * type will be defaulted to `unhandled-error`
   */
  constructor(errorCode: number, e: Error, classification?: string) {
    super(e.message);
    this.stack = e.stack;

    classification = classification || `unhandled-error/${e.name}`;
    classification = classification.includes("/")
      ? classification
      : `unhandled-error/${classification}`;
    const [type, subType] = classification.split("/");

    this.name = type;
    this.code = subType;
    this.httpStatus = errorCode;
  }
}
