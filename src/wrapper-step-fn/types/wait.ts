import { datetime } from 'common-types'
import { IBaseOptions, IBaseState, IConfigurableStepFn } from '../../private';

export interface IWaitOptions extends IBaseOptions {
  /** A time, in seconds, to wait before beginning the state specified in the Next field. */
  seconds?: number;
  /** An absolute time to wait until before beginning the state specified in the Next field. Timestamps must conform to the RFC3339 profile of ISO 8601, with the further restrictions that an uppercase T must separate the date and time portions, and an uppercase Z must denote that a numeric time zone offset is not present, for example, 2016-08-18T17:33:00Z.*/
  timestamp?: datetime;
  /** A time, in seconds, to wait before beginning the state specified in the Next field, specified using a path from the state's input data. */
  secondsPath?: string;
  /** An absolute time to wait until before beginning the state specified in the Next field, specified using a path from the state's input data. */
  timestampPath?: string;
}

export interface IWaitCallable<T = string> {
  (options?: IWaitOptions): IConfigurableStepFn
}
export interface IWaitConfiguration<T = string> {
  (options?: IWaitOptions): IWait
}

export type IWait = Omit<IWaitOptions, "name"> & IBaseState & {
  readonly type: "Wait"
  isTerminalState: false
}