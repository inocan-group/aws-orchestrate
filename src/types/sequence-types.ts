import { IErrorClass } from "./general";

export interface ISequenceTrackerStatusBase {
  /**
   * The `correlationId` of the sequence executing
   */
  correlationId: string;
  /**
   * The total number of steps in the sequence
   */
  total: number;
  /**
   * The current step in the sequence
   */
  current: number;
  /**
   * The AWS `arn` of the currently executing function
   */
  currentFn: string;
  /**
   * The AWS `arn` of the function which originated
   * the sequence.
   */
  originFn?: string;
  /**
   * The current status of the sequence
   */
  status: string;
}

export interface ISequenceTrackerStatusSuccess extends ISequenceTrackerStatusBase {
  status: "success";
  data: string;
}
export interface ISequenceTrackerStatusError extends ISequenceTrackerStatusBase {
  status: "error";
  error: IErrorClass;
}
export interface ISequenceTrackerStatusRunning extends ISequenceTrackerStatusBase {
  status: "running";
}
export type ISequenceTrackerStatus =
  | ISequenceTrackerStatusSuccess
  | ISequenceTrackerStatusError
  | ISequenceTrackerStatusRunning;

export interface ISequenceTrackerRequest {
  status: ISequenceTrackerStatus;
  firebaseSecretLocation?: string;
}
