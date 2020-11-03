import { IBaseOptions, IBaseState, IFinalizedStepFn, IState, TerminalState } from '.'

export interface IFailConfiguration {
  (cause: string, options?: IFailOptions): IFail
}

export interface IFailOptions extends IBaseOptions {
  /** Provides an error name that can be used for error handling (Retry/Catch), operational, or diagnostic purposes. */
  error?: string;
}

export type IFail = Omit<IFailOptions, "name"> & IBaseState & {
  readonly type: 'Fail'
  /** Provides a custom failure string that can be used for operational or diagnostic purposes. */
  cause: string
} & TerminalState
