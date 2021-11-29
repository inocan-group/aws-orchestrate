import { ILoggerApi } from "aws-log";
import type * as AwsXray from "aws-xray-sdk-core";
import { AwsStage } from "common-types";
import { getArnComponentsFromEnv } from "~/shared/parse";
import { IError, IWrapperMetricsClosure } from "~/types";

export class XRay {
  private segment: AwsXray.Segment | AwsXray.Subsegment | undefined;
  private prep: AwsXray.Subsegment | undefined;
  private handler: AwsXray.Subsegment | undefined;
  private closeOut: AwsXray.Subsegment | undefined;

  private log: ILoggerApi;
  private stage: AwsStage;

  /**
   * A class provided by `aws-orchestrate` to expose the XRAY API
   * in a useful way to the wrapper function.
   *
   * It will only take actions if the user of the wrapper function
   * passes down the **AwsXray** API:
   *
   * ```ts
   * import XRay from "aws-xray-core";
   * export const handler = wrapper(fn, { XRay });
   * ```
   */
  constructor(log: ILoggerApi, xray: typeof AwsXray | undefined) {
    this.stage = (getArnComponentsFromEnv().stage || "dev") as AwsStage;
    this.log = log;
    if (this.stage !== "local") {
      this.segment = xray ? xray.getSegment() : undefined;
    }
  }

  /** flag indicating whether the XRay API is ready to be used */
  public get ready(): boolean {
    return this.segment ? true : false;
  }

  /** adds the "Prep" subsegment to XRAY */
  public startPrep() {
    if (this.segment) {
      this.prep = this.segment.addNewSubsegment("Prep");
      this.log.debug("XRay service is available");
    }
  }

  /** closes the "Prep" subsegment to XRAY, optionally with an error */
  public finishPrep<T extends unknown>(error?: T) {
    if (this.segment && this.prep) {
      if (error) {
        this.prep.addError(error);
      }
      this.prep.close();
    }
  }

  /**
   * Starts the handler segment
   */
  public startHandler() {
    if (this.segment) {
      this.handler = this.segment.addNewSubsegment("Handler");
    }
  }

  /**
   * Ends the handler segment
   */
  public finishHandler() {
    if (this.segment && this.handler && !this.handler.isClosed) {
      this.handler.close();
    }
  }

  public startCloseout() {
    if (this.segment) {
      this.closeOut?.addNewSubsegment("Close Out");
    }
  }

  public handlerFunctionCalled(type: "known" | "default") {
    if (this.segment && this.closeOut) {
      this.closeOut.addAnnotation("handlerFunctionCalled", type);
    }
  }

  /** adds an annotation about where the error was forwarded */
  public errorForwarded(arn: string) {
    if (this.segment && this.closeOut) {
      this.closeOut.addAnnotation("errorForwarded", arn);
    }
  }

  /** adds  */
  public finishCloseout<T extends IError>(metrics: IWrapperMetricsClosure, error?: T) {
    if (this.segment && this.closeOut) {
      this.closeOut.addAnnotation("duration", metrics.duration);
      this.closeOut.addAnnotation("prepTime", metrics.prepTime);
      this.closeOut.addAnnotation("closureDuration", metrics.closureDuration);
      this.closeOut.addAnnotation(
        "total",
        metrics.prepTime + metrics.duration + metrics.closureDuration
      );

      if (error) {
        this.closeOut.addError(error);
      }
      this.closeOut.close();
    }
  }
}
