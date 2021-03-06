/* eslint-disable no-use-before-define */
import { ICatchConfig, ICatchFluentApi, IStepFnState } from "~/step-fn";
import {
  IState,
  Finalized,
  ITaskOptions,
  IFailOptions,
  IWaitOptions,
  IParallelBranchOptions,
  IPassOptions,
  IParallelOptions,
  Result,
  ParallelFluentApi,
  IChoiceParams,
  IMapBuilder,
} from "~/types";

export enum ParamsKind {
  StepFnOptions = "StepFnOptions",
}

export interface IStepFnOptions {
  /**
   * you can add a named prefix to a step function
   * so that all _states_ defined within this step
   * function are prefixed with name.
   *
   * This helps to reduce state name collisions in
   * complex state machines.
   */
  namePrefix?: string;
  /**
   * this flag is to set that all states returned should not have a startedAt property set
   */
  excludeStartAt?: boolean;

  /**
   * Error handler used for all children states unless their overrites this one using `catch` option explicitely
   */
  catch?: ICatchConfig | ICatchFluentApi;
}

/**
 * This type represents a finalized Step Function
 */
export interface IFinalizedStepFn {
  getState: () => Array<Result<IState>>;
  getOptions: () => IStepFnOptions;
}

export type ICatchConfigurableStepFn = {
  goTo(finalizedState: Finalized<IState> | string): IFinalizedStepFn;
} & IConfigurableStepFn;

/**
 * The API that will be used to call another states in order to build our step function.
 */
export interface IConfigurableStepFn {
  readonly state: Array<IState | Finalized<IState>>;
  /**
   * This state represents a single unit of work performed by a state machine.
   *
   * All work in your state machine is done by tasks.
   *
   * A task performs work by using an activity or an AWS Lambda function, or by passing parameters to the API actions of other services.
   */
  task(resourceName: string, options?: ITaskOptions): this;
  /**
   * This state stops an execution successfully.
   *
   * The Succeed state is a useful target for Choice state branches that don't do anything but stop the execution.
   */
  succeed(name?: string): IFinalizedStepFn;
  /**
   * This state can be used to run a set of steps for each element of an input array.
   *
   * While the Parallel state executes multiple branches of steps using the same input, a Map state will execute the same steps for multiple entries of an array in the state input.
   */
  map(builder: (builder: IMapBuilder<"state">) => IMapBuilder<any>): this;
  /**
   * This state stops the execution of the state machine and marks it as a failure.
   */
  fail(cause: string, options?: IFailOptions): IFinalizedStepFn;
  /**
   * Given a certains conditions it should invoke diferent steps to follow the workflow
   */
  choice(...params: IChoiceParams): IFinalizedStepFn;
  /**
   * This state can be used to create parallel branches of execution in your state machine.
   */
  parallel(
    ...params:
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>]
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>, IParallelOptions]
      | IParallelBranchOptions[]
      | [...IParallelBranchOptions[], IParallelOptions]
  ): this;
  /**
   * This passes its input to its output, without performing work.
   *
   * Pass states are useful when constructing and debugging state machines.
   */
  pass(options?: IPassOptions): this;
  /**
   * This state delays the state machine from continuing for a specified time.
   *
   * You can choose either a relative time, specified in seconds from when the state begins, or an absolute end time, specified as a timestamp.
   */
  wait(options?: IWaitOptions): this;

  finalize(): IFinalizedStepFn;
}

/**
 * It lets you use a fluent api for configuring a set of step function's states
 */
// export interface FluentApi<I,O, E extends string[]=[]> {
//   (sf: I): O | Finalized<O>;
// }
export interface FluentApi<I, O> {
  (sf: I): O;
}

export type IStepFnFluentApi = FluentApi<
  IConfigurableStepFn,
  IConfigurableStepFn | IFinalizedStepFn
>;

/**
 * It lets you use a fluent api or passing states and options directly
 */
export type IStepFnSelector = IStepFnFluentApi | IStepFnShorthand | IStepFn;

/**
 * Wraps `IStepFunction` in order to be able to pass the store
 *
 * It's a wrapper being used internally
 */
// export type IStepFnShorthand = TupleWithOptionalTail<(StepFnState | IStepFnOptions)[] | [StepFnState, IStepFnOptions]>;
export type IStepFnShorthand = IStepFnState[] | [...IStepFnState[], IStepFnOptions];

/**
 * Creates a new step function with the options provided (optional)
 *
 * This should return an api that let's you continue building a step function adding states
 */
export interface IStepFunctionFactory {
  /**
   * It accepts states (such as task, choice, etc) `IState` and a step function option hash `IStepFnOptions`
   */
  catch?: ICatchConfig | ICatchFluentApi;
  (...params: IStepFnShorthand): IConfigurableStepFn;
}

/**
 * A wrapper for the states definition functions to be able to pass store and Step Function's api that
 * most of the cases it will be what we should see as return value of the wrapped function
 */
export type CallableConfiguration<T> = (
  cb: () => IConfigurableStepFn,
  commit: IStore["commit"]
) => T;

// type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never

export interface IStore {
  /**
   * Provides all state functions (e.g., task, choice, etc.)
   * with a function to call
   */
  commit: (payload: IState) => void;
  /**
   * Returns all steps definition included in the following step function
   */
  getState: () => IState[];
}

export type IStepFn = IConfigurableStepFn | IFinalizedStepFn;
