import {
  ITask,
  ISucceed,
  IFail,
  IChoice,
  IMap,
  IWait,
  IParallel,
  ITaskOptions,
  IMapOptions,
  IMapUseCallable,
  IFailOptions,
  IDefaultChoiceOptions,
  IChoiceConditionOptions,
  IChoiceOptions,
  IParallelBranchOptions,
  IParallelOptions,
  IWaitOptions,
} from '.'
import { IPass, IPassOptions } from './pass'

export type Result<T extends IState> = Finalized<T> | T

export type IStateConfiguring = {
  /**
   * This state represents a single unit of work performed by a state machine.
   *
   * All work in your state machine is done by tasks.
   *
   * A task performs work by using an activity or an AWS Lambda function, or by passing parameters to the API actions of other services.
   */
  task(resourceName: string, options: ITaskOptions & { name: string }): Finalized<ITask>
  task(resourceName: string, options?: Omit<ITaskOptions, "name">): ITask
  /**
   * This state stops an execution successfully.
   *
   * The Succeed state is a useful target for Choice state branches that don't do anything but stop the execution.
   */
  succeed(name: string): Finalized<ISucceed>
  succeed(): ISucceed
  /**
   * This state can be used to run a set of steps for each element of an input array.
   *
   * While the Parallel state executes multiple branches of steps using the same input, a Map state will execute the same steps for multiple entries of an array in the state input.
   */
  map(itemsPath: string, options?: IMapOptions & { name: string }): IMapUseCallable<Finalized<IMap>>
  map(itemsPath: string, options?:  Omit<IMapOptions, "name">): IMapUseCallable<IMap>
  /**
   * This state stops the execution of the state machine and marks it as a failure.
   */
  fail(cause: string, options?: IFailOptions & { name: string }): Finalized<IFail>
  fail(cause: string, options?:  Omit<IFailOptions, "name">): IFail
  /**
   * Given a certains conditions it should invoke diferent steps to follow the workflow
   */
  choice(
    choices: (IDefaultChoiceOptions | IChoiceConditionOptions)[],
    options?: IChoiceOptions & { name: string },
  ): Finalized<IChoice>
  choice(
    choices: (IDefaultChoiceOptions | IChoiceConditionOptions)[],
    options?:  Omit<IChoiceOptions, "name">,
  ): IChoice
  /**
   * This state can be used to create parallel branches of execution in your state machine.
   */
  parallel(branches: IParallelBranchOptions[], options?: IParallelOptions & { name: string }): Finalized<IParallel>
  parallel(branches: IParallelBranchOptions[], options?: Omit<IParallelOptions, "name">): IParallel
  /**
   * This state delays the state machine from continuing for a specified time.
   *
   * You can choose either a relative time, specified in seconds from when the state begins, or an absolute end time, specified as a timestamp.
   */
  wait(options?: IWaitOptions & { name: string }): Finalized<IWait>
  wait(options?: Omit<IWaitOptions, "name">): IWait
  /**
   * This passes its input to its output, without performing work.
   *
   * Pass states are useful when constructing and debugging state machines.
   */
  pass(options?: IPassOptions & { name: string }): Finalized<IPass>
  pass(options?: Omit<IPassOptions, "name">): IPass 
}

export type IState =  IConfigurableState | ITerminalState

export type ITerminalState = IChoice | ISucceed | IFail

export type IConfigurableState = ITask | IMap | IWait | IParallel | IPass

/**
 * This type represent a state that has already defined and should not be able to be modified
 */
export type isFinalized = { isFinalized: true, name: string }
export type Finalized<T extends IState> = Readonly<T & isFinalized> 

export type TerminalState = { isTerminalState: true }

export interface IBaseState  {
  /**
   * Indicates wheter particular state type is a terminal state which means
   * that must be the final state in a step function
   */
  isTerminalState: boolean

  /**
   * Indicates that the state has already been set name and is readonly. It should be used only once in the state machine
   */
  isFinalized: boolean
}