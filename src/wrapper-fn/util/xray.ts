import { ILoggerApi } from "aws-log";
import type {getSegment, Segment, Subsegment} from "aws-xray-sdk-core";
import { AwsStage } from "common-types";
import { getArnComponentsFromEnv } from "~/shared/parse";
import { IError, IWrapperMetricsClosure } from "~/types";

export class XRay {
  private segment: Segment | Subsegment | undefined;
  private prep: Subsegment | undefined;
  private handler: Subsegment | undefined;
  private closeOut: Subsegment | undefined;


  private log: ILoggerApi;
  private _silent: boolean = false;
  private stage: AwsStage;

  constructor(log: ILoggerApi, xray: {getSegment: typeof getSegment} | undefined) {
    this.stage = (getArnComponentsFromEnv().stage || 'dev') as AwsStage;
    this.log = log;
    if(this.stage !== 'local') {
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
  public finishPrep<T extends IError>(error?: T) {
    if(this.segment && this.prep) {
      if(error) {
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
    if(this.segment) {
      this.closeOut?.addNewSubsegment("Close Out");
    }
  }

  public handlerFunctionCalled(type: 'known' | 'default') {
    if(this.segment && this.closeOut) {
      this.closeOut.addAnnotation('handlerFunctionCalled', type);
    }
  }

  /** adds an annotation about where the error was forwarded */
  public errorForwarded(arn: string) {
    if(this.segment && this.closeOut) {
      this.closeOut.addAnnotation('errorForwarded', arn);
    }
  }

  /** adds  */
  public finishCloseout<T extends IError>(metrics: IWrapperMetricsClosure, error?: T) {
    if(this.segment && this.closeOut) {
      this.closeOut.addAnnotation("duration", metrics.duration);
      this.closeOut.addAnnotation("prepTime", metrics.prepTime);
      this.closeOut.addAnnotation("closureDuration", metrics.closureDuration);
      this.closeOut.addAnnotation("total", metrics.prepTime + metrics.duration+ metrics.closureDuration);
      if(error) {
        this.closeOut.addError(error);
      }
      this.closeOut.close();
    }
  }



  /** turns on silent mode, disabling all logging during this period */
  public silent() {
    this._silent = true;
    return this;
  }

  /** the inverse of `silent`, tt turns silent mode off allowing logging to take place */
  public normal() {
    this._silent = false;
    return this;
  }

  public setUser(user: string) {
    if (this.xray) {
      const document = ;
    }
  }
}
