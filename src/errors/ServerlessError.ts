import { HttpStatusCodes, isTypeSubtype, TypeSubtype } from "common-types";
import { IServerlessError } from "~/types";

export class ServerlessError<EH extends Error = Error> extends Error implements IServerlessError {
  public kind = "ServerlessError";
  public name = "ServerlessError";

  public code: string;

  /** the HTTP errorCode */
  httpStatus: HttpStatusCodes | number;

  /**
   * The type/sub-type of the error
   */
  classification: TypeSubtype;

  /**
   * The handler function' name
   */
  functionName!: string;

  /** the AWS requestId */
  requestId!: string;

  /**
   * the sequence's correlation ID
   */
  correlationId!: string;
  /**
   * The specific AWS request ID used for this function's execution
   */
  awsRequestId!: string;

  /**
   * If error occurred as a "secondary error" during the
   * wrapper function's callback handler
   */
  public errorHandlingError?: EH;

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

    if (isTypeSubtype(classification)) {
      this.classification = classification;
    } else {
      const parts = classification.split("/");
      this.classification = (parts.length === 1
        ? `aws-orchestrate/${classification}`
        : `${parts[0]}/${parts[1]}`) as TypeSubtype;
    }
    this.code = this.classification.split("/")[1];
    this.httpStatus = errorCode;
  }
}
