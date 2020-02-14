export class UnhandledError extends Error {
  /**
   * The `name` is of the format `type`/`sub-type`
   */
  name: string;
  /**
   * The `code` is the "sub-type" of the name
   */
  code: string;

  type: "unhandled-error" = "unhandled-error";

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
  constructor(errorCode: number, e: Error & { code?: string }, classification?: string) {
    super(e.message);
    this.stack = e.stack;

    classification = classification || `unhandled-error/${e.name || e.code}`;

    classification = classification.includes("/") ? classification : `unhandled-error/${classification}`;

    const [type, subType] = classification.split("/");

    this.name = type;
    this.code = subType;
    this.httpStatus = errorCode;
  }
}
