import { ICatchConfig, ICatchFluentApi, IRetryConfig, IRetryFluentApi } from "~/step-fn";
import {
  IBaseOptions,
  IBaseState,
  IConfigurableStepFn,
  IFinalizedStepFn,
  IStepFnShorthand,
  IStepFn,
} from "~/types";
import { IStepFnSelector } from "./stepFunction";

export interface IParallelCallable {
  (branches: IParallelBranchOptions[], options?: IParallelOptions): IConfigurableStepFn;
}
export interface IParallelConfiguration {
  (branches: IParallelBranchOptions[], options?: IParallelOptions): IParallel;
}

export interface IParallelOptions extends IBaseOptions {
  catch?: ICatchConfig | ICatchFluentApi;
  /** An array of objects, called Retriers that define a retry policy in case the state encounters runtime errors. */
  retry?: IRetryConfig | IRetryFluentApi;
}

export interface ParallelFluentApi {
  addBranch(selector: IStepFnSelector): this;
}

export type IParallelBranchOptions = IStepFnShorthand | IStepFn;

export type IParallel = Omit<IParallelOptions, "name"> &
  IBaseState & {
    readonly type: "Parallel";
    branches: IParallelBranch[];
    isTerminalState: false;
  };

export interface IParallelBranch extends Omit<IParallelBranchOptions, "stepFn"> {
  deployable: IFinalizedStepFn;
}
