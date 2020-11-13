import { IBaseOptions, IBaseState, IFinalizedStepFn, IState, TerminalState } from '../../private'

export interface ISucceedCallable {
  (): IFinalizedStepFn
}

export interface ISucceedConfiguration {
  (): ISucceed
}

export type ISucceed = Omit<IBaseOptions, 'name'> &
  IBaseState & {
    readonly type: 'Succeed'
  }
  & TerminalState
