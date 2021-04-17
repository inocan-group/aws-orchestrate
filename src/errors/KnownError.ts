import { isTypeSubtype, TypeSubtype } from "common-types";
import { IServerlessError, IWrapperContext } from "~/types";
import { ErrorHandler } from "./ErrorHandler";

export class KnownError<I, O, E extends Error = Error> extends Error implements IServerlessError {
  public readonly kind = "KnownError";
  public name = "KnownError";
  public httpStatus;
  public functionName;
  public classification: TypeSubtype;
  public awsRequestId;
  public correlationId;
  public code;

  constructor(
    public originatingError: E,
    handler: ErrorHandler<I, O>,
    context: IWrapperContext<any, any>,
    classification?: string
  ) {
    super();
    this.message = originatingError.message;
    this.stack = originatingError.stack;
    this.httpStatus = handler.code;
    if (classification) {
      if (isTypeSubtype(classification)) {
        this.classification = classification;
        this.code = (originatingError as any).code
          ? (originatingError as any).code
          : (classification.split("/").pop() as string);
      } else {
        const parts = classification.split("/");
        this.classification = (parts.length === 1
          ? `aws-orchestrate/${classification}`
          : `${parts[0]}/${parts[1]}`) as TypeSubtype;
        const code = (originatingError as any).code ? ((originatingError as any).code as string) : undefined;
        this.code = code ? code : parts.length === 1 ? classification : "known-error";
      }
    } else {
      this.classification = "wrapper-fn/known-error";
      this.code = "known-error";
    }
    this.functionName = context.functionName;
    this.awsRequestId = context.awsRequestId;
    this.correlationId = context.correlationId;
  }
}
