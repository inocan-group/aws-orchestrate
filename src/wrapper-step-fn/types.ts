import { IStateMachine, IStepFunctionType } from 'common-types'

/**
 * Success
 */
 export type ISuccess = () => IStepFunctionDeployableApi

 /**
 * Fail
 */
export type IFail = (reason: string) => IStepFunctionDeployableApi

/**
 * Task
 */
export interface ITaskOptions {}
export type ITaskDefn = IBaseStateDefn & { resourceName: string }
export type ITask = (name: string, options?: ITaskOptions) => IStepFunctionApi

/**
 * Choice
 */
export interface IChoiceOptions {}
export type IChoiceDefn = IBaseStateDefn
export type IChoiceStep = { parameter: string; condition: string; sf: (sf: IStepFunctionApi) => IStepFunctionDeployableApi }
export type IChoice = (branches: IChoiceStep[], options?: IChoiceOptions) => IStepFunctionDeployableApi

/**
 * Map
 */
export interface IMapOptions {}
export type IMapDefn = IBaseStateDefn
export type IMapUse = { use: (cb: (sf: IStepFunctionApi) => IStepFunctionDeployableApi) => IStepFunctionApi }
export type IMap = (itemsPath: string, options?: IMapOptions) => IMapUse

/**
 * Wraps `IStepFunction` in order to be able to pass the store 
 * 
 * It's a wrapper being used internally
 */
export type IStepFunctionWrapper = (options: IStepFnOptions) => (store?: IStepFnStore) => IStepFunctionApi

/**
 * Creates a new step function with the options provided (optional)
 * 
 * This should return an api that let's you continue building a step function adding states
 */
export type IStepFunction = (options?: IStepFnOptions) => IStepFunctionApi

/**
 * A wrapper for the states definition functions to be able to pass store and Step Function's api that
 * most of the cases it will be what we should see as return value of the wrapped function
 */
export type StateWrapper<T> = (api: () => IStepFunctionApi, store: IStepFnStore) => T


/**
 * The API that will be used to call another states in order to build our step function.
 */
export interface IStepFunctionApi {
  /**
   * This will be used to create a `Task` State. Most common used step for calling a lambda function
   */
  task: ITask
  success: ISuccess
  map: IMap,
  fail: IFail
}

export interface IBaseStateDefn {
  /**
   * A identier of the state definition that will be used to do not have duplicates issues
   */
  id: string
  /**
   * the next state definition which this state should point to
   */
  next?: string

  ends?: boolean
}
export type IStateDefn = ITaskDefn | IChoiceDefn | IMapDefn
export interface IStepFnOptions {
  /**
   * if two states result in the same name, you can optionally
   * have the `StepFunction()` add an index number to the end
   * of the name to avoid conflict.
   */
  autoIndexNames: boolean

  /**
   * you can add a named prefix to a step function
   * so that all _states_ defined within this step
   * function are prefixed with name.
   *
   * This helps to reduce state name collisions in
   * complex state machines.
   */
  namePrefix?: string
}
export interface IStepFnStore {
  /**
   * Provides all state functions (e.g., task, choice, etc.)
   * with a function to call
   */
  commit: (type: IStepFunctionType, ...payload: IStateDefn[]) => void
  getState: () => IStateDefn[]
}

/**
 * Its a terminal state of a step function.
 * 
 * Mostly used to determine that we finished to define the step function
 */
export type IStepFunctionDeployableApi = Omit<IStepFnStore, 'commit'>

/**
 * It's responsible of having the state of our state machine and provides several handful methods 
 * needed to deploy or interact with our state machine
 */
export interface IStateMachineApi {
  generate(): IStateMachine
  toYaml(): string
}
