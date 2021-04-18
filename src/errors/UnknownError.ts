import { IDictionary, isTypeSubtype, TypeSubtype } from "common-types";
import { IServerlessError, IWrapperContext } from "~/types";

export class UnknownError<T extends Error = Error, EH extends Error = Error>
  extends Error
  implements IServerlessError {
  public readonly kind = "UnknownError";
  public name = "UnknownError";
  public httpStatus;
  public functionName;
  public classification: TypeSubtype;
  public awsRequestId;
  public correlationId;
  public code;
  /**
   * If error occurred as a "secondary error" during the
   * wrapper function's callback handler
   */
  public underlyingError?: EH;

  constructor(
    public originatingError: T,
    context: IWrapperContext<any, any>,
    classification?: string
  ) {
    super();
    this.message = originatingError.message;
    this.stack = originatingError.stack;
    this.httpStatus =
      (originatingError as IDictionary).httpStatus || context.errorMgmt.defaultErrorCode;
    if (classification) {
      if (isTypeSubtype(classification)) {
        this.classification = classification;
        this.code = classification.split("/").pop() as string;
      } else {
        const parts = classification.split("/");
        this.classification = (parts.length === 1
          ? `aws-orchestrate/${classification}`
          : `${parts[0]}/${parts[1]}`) as TypeSubtype;
        this.code = parts.length === 1 ? classification : "unknown-error";
      }
    } else {
      this.classification = "wrapper-fn/unknown-error";
      this.code = "unknown-error";
    }
    this.functionName = context.functionName;
    this.awsRequestId = context.awsRequestId;
    this.correlationId = context.correlationId;
  }
}
