import {
  ITask,
  ISucceed,
  IFail,
  IChoice,
  IMap,
  IWait,
  IParallel,
  ITaskOptions,
  IFailOptions,
  IChoiceDefaultItemParam,
  IChoiceItemParam,
  IChoiceOptions,
  IParallelBranchOptions,
  IParallelOptions,
  IWaitOptions,
  IPassOptions,
  IPass,
  ParallelFluentApi,
  FluentApi,
  IChoiceItemConfigurator,
  IMapBuilder,
} from "~/types";

/**
 * A state unit of work that can be finalized or not
 */
export type Result<T extends IState> = Finalized<T> | T;

export type IStateConfiguring = {
  /**
   * This state represents a single unit of work performed by a state machine.
   *
   * All work in your state machine is done by tasks.
   *
   * A task performs work by using an activity or an AWS Lambda function, or by passing parameters to the API actions of other services.
   */
  task(resourceName: string, options: ITaskOptions & { name: string }): Finalized<ITask>;
  task(resourceName: string, options?: Omit<ITaskOptions, "name">): ITask;
  /**
   * This state stops an execution successfully.
   *
   * The Succeed state is a useful target for Choice state branches that don't do anything but stop the execution.
   */
  succeed(name: string): Finalized<ISucceed>;
  succeed(): ISucceed;
  /**
   * This state can be used to run a set of steps for each element of an input array.
   *
   * While the Parallel state executes multiple branches of steps using the same input, a Map state will execute the same steps for multiple entries of an array in the state input.
   */
  map(builder: (builder: IMapBuilder<"state">) => IMapBuilder<any>): IMap;
  map(builder: (builder: IMapBuilder<"state">) => IMapBuilder<any>):  Finalized<IMap>;
  /**
   * This state stops the execution of the state machine and marks it as a failure.
   */
  fail(cause: string, options?: IFailOptions & { name: string }): Finalized<IFail>;
  fail(cause: string, options?: Omit<IFailOptions, "name">): IFail;
  /**
   * Given a certains conditions it should invoke diferent steps to follow the workflow
   */
  choice(
    ...params:
      | [IChoiceItemConfigurator]
      | [IChoiceItemConfigurator, IChoiceOptions & { name: string }]
      | (IChoiceDefaultItemParam | IChoiceItemParam)[]
      | [...(IChoiceDefaultItemParam | IChoiceItemParam)[], IChoiceOptions & { name: string }]
  ): Finalized<IChoice>;
  choice(
    ...params:
      | [IChoiceItemConfigurator]
      | [IChoiceItemConfigurator, Omit<IChoiceOptions, "name">]
      | (IChoiceDefaultItemParam | IChoiceItemParam)[]
      | [...(IChoiceDefaultItemParam | IChoiceItemParam)[], Omit<IChoiceOptions, "name">]
  ): IChoice;

  /**
   * This state can be used to create parallel branches of execution in your state machine.
   */
  parallel(
    ...params:
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>]
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>, IParallelOptions & { name: string }]
      | IParallelBranchOptions[]
      | [...IParallelBranchOptions[], IParallelOptions & { name: string }]
  ): Finalized<IParallel>;
  parallel(
    ...params:
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>]
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>, Omit<IParallelOptions, "name">]
      | IParallelBranchOptions[]
      | [...IParallelBranchOptions[], Omit<IParallelOptions, "name">]
  ): IParallel;
  /**
   * This state delays the state machine from continuing for a specified time.
   *
   * You can choose either a relative time, specified in seconds from when the state begins, or an absolute end time, specified as a timestamp.
   */
  wait(options?: IWaitOptions & { name: string }): Finalized<IWait>;
  wait(options?: Omit<IWaitOptions, "name">): IWait;
  /**
   * This passes its input to its output, without performing work.
   *
   * Pass states are useful when constructing and debugging state machines.
   */
  pass(options?: IPassOptions & { name: string }): Finalized<IPass>;
  pass(options?: Omit<IPassOptions, "name">): IPass;

  goTo(finalizedState: Finalized<IState> | string): Finalized<IGoTo>;
};

export type IGoTo = {
  type: "GoTo";
  next: string;
  isFinalized: boolean;
} & TerminalState;

export type IState = IConfigurableState | ITerminalState | IUtilState;
export type IUtilState = IGoTo;
export type ITerminalState = IChoice | ISucceed | IFail;
export type IConfigurableState = ITask | IMap | IWait | IParallel | IPass;

/**
 * This type represent a state that has already defined and should not be able to be modified
 */
export type Finalized<T extends IState> = Readonly<T & isFinalized>;
export type isFinalized = { isFinalized: true; name: string };

export type TerminalState = { isTerminalState: true };

export interface IBaseState {
  /**
   * Indicates wheter particular state type is a terminal state which means
   * that must be the final state in a step function
   */
  isTerminalState: boolean;

  /**
   * Indicates that the state has already been set name and is readonly. It should be used only once in the state machine
   */
  isFinalized: boolean;
}
