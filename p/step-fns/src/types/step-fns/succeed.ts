import { IBaseOptions, IBaseState, IFinalizedStepFn, TerminalState } from "~/types";

export interface ISucceedCallable {
  (): IFinalizedStepFn;
}

export type ISucceed = Omit<IBaseOptions, "name"> &
  IBaseState & {
    readonly type: "Succeed";
  } & TerminalState;

export interface ISucceedConfiguration {
  (): ISucceed;
}
