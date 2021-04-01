import { IAwsLogContext } from "aws-log";
import { IErrorWithExtraProperties } from "../@types";

export class HandledError extends Error {
  public kind = "HandledError";
  /**
   * Create a serialized/string representation of the error
   * for returning to **API Gateway**
   */
  public static apiGatewayError(errorCode: number, e: Error, context: IAwsLogContext) {
    const obj = new HandledError(errorCode, e, context);
    return JSON.stringify({
      errorType: obj.name,
      httpStatus: obj.httpStatus,
      requestId: obj.requestId,
      message: obj.message,
    });
  }

  /**
   * creates an error to be thrown by a **Lambda** function which
   * was initiatiated by a
   */
  public static lambdaError(errorCode: number, e: Error, context: IAwsLogContext) {
    const obj = new HandledError(errorCode, e, context);
  }

  /**
   * The `name` is proxied through if underlying error has one that is NOT just **Error**;
   * otherwise it takes on the functions name
   */
  name: string;
  /**
   * The `code` is proxied through if underlying error has one and if not then it
   * takes on the string `handled-error`
   */
  code: string;

  type = "handled-error";

  classification: string;
  functionName: string;

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
   * type will be defaulted to `handled-error`
   */
  constructor(errorCode: number, e: IErrorWithExtraProperties, context: IAwsLogContext) {
    super(e.message);
    this.stack = e.stack;

    const type: string = e.name && e.name !== "Error" ? e.name : context.functionName;
    const subType: string = e.code ? String(e.code) : "handled-error";
    this.classification = `${type}/${subType}`;
    this.functionName = context.functionName;
    this.name = type;
    this.code = subType;

    this.httpStatus = errorCode;
  }
}
