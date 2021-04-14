import { IDictionary } from "common-types";
import { ICatchConfig } from "~/step-fn";
import type {
  ErrDefn,
  IBaseState,
  IConfigurableStepFn,
  IFinalizedStepFn,
  IFluentApi,
  IOptionsWithInput,
  IStepFnShorthand,
  RetryOptions,
} from "~/types";

export type IMapUseParams = IFluentApi | IStepFnShorthand;

export interface IMapOptions extends IOptionsWithInput {
  /**
   * The `ItemsPath` field’s value is a reference path identifying where in the effective input the array field is found.
   *
   * States within an `Iterator` field can only transition to each other, and no state outside the `ItemsPath` field can transition to a state within it.
   * If any iteration fails, entire Map state fails, and all iterations are terminated.
   */
  itemsPath?: string;
  parameters?: IDictionary;
  resultPath?: string;
  /** The `MaxConcurrency`field’s value is an integer that provides an upper bound on how many invocations of the Iterator may run in parallel. For instance, a `MaxConcurrency` value of 10 will limit your Map state to 10 concurrent iterations running at one time. */
  maxConcurrency?: number;
  /** An array of objects, called Retriers that define a retry policy in case the state encounters runtime errors. */
  retry?: Record<string, RetryOptions>;
  catch?: ICatchConfig;
}

export interface IMapUseConfiguration<T> {
  (params: IFluentApi | IStepFnShorthand): T;
}

export interface IMapUseConfigurationWrapper<T> {
  (itemsPath: string, options?: IMapOptions): (...params: IMapUseParams[]) => T;
}

export interface IMapUseCallable<T> {
  use: IMapUseConfiguration<T>;
}
export interface IMapCallable {
  (itemsPath: string, options?: IMapOptions): IMapUseCallable<IConfigurableStepFn>;
}

export interface IMapConfiguration {
  (itemsPath: string, options?: IMapOptions): IMapUseCallable<IMap>;
}

export type IMap = Omit<IMapOptions, "name"> &
  IBaseState & {
    readonly type: "Map";
    deployable: IFinalizedStepFn;
    isTerminalState: false;
  };
