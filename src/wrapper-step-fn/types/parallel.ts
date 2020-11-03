import { IBaseOptions, IBaseState, IConfigurableStepFn, IErrorHandler, IState, IStepFnSelector } from ".";
import { IFinalizedStepFn } from "./stepFunction";

export interface IParallelCallable {
  (branches: IParallelBranchOptions[], options?: IParallelOptions): IConfigurableStepFn
}
export interface IParallelConfiguration {
  (branches: IParallelBranchOptions[], options?: IParallelOptions): IParallel
}

export interface IParallelOptions extends IBaseOptions {
  /** An array of objects, called Retriers that define a retry policy in case the state encounters runtime errors. */
  Retry?: string[];
  Catch?: IErrorHandler[];
}

export type IParallelBranchOptions = IStepFnSelector


export type IParallel = Omit<IParallelOptions, "name"> & IBaseState & {
  readonly type: "Parallel";
  branches: IParallelBranch[]
  isTerminalState: false
  isFinalized: false
}

export interface IParallelBranch extends Omit<IParallelBranchOptions, 'stepFn'>  { 
  deployable: IFinalizedStepFn
}
