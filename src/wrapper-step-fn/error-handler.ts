import { hash } from 'native-dash'
import { ServerlessError } from '../errors'
import { ErrDefn, IErrHandlerApi, IErrorHandlerPointer, IErrorTypeSelector } from '../private'
import {
  Finalized,
  IConfigurableStepFn,
  IErrorType,
  IFinalizedStepFn,
  IGoTo,
  IRetryHandlerApi,
  IState,
  IStore,
  RetryOptions,
} from './types'

/**
 * Step Function Errors
 *
 * [AWS Documentation](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)
 */
export const errorTypes: IErrorType = {
  all: 'States.ALL',
  runtime: 'States.Runtime',
  timeout: 'States.Timeout',
  dataLimitExceeded: 'States.DataLimitExceeded',
  taskFailed: 'States.TaskFailed',
  permissions: 'States.Permissions',
  custom(error: string) {
    return error
  },
}

/**
 * Proposal:
 * 
 * Use same utiliy functions as retry but for errors taking benefit of Typescript Union, so we can reuse same utility function, but it will have different behaviour based on our needs.
 */

export function allErrors(opts: RetryOptions) {
  return retryApi({}).allErrors(opts);
}

export function runtime(opts: RetryOptions) {
  return retryApi({}).runtime(opts);
}

export function timeout(opts: RetryOptions) {
  return retryApi({}).timeout(opts);
}

export function dataLimitExceeded(opts: RetryOptions) {
  return retryApi({}).dataLimitExceeded(opts);
}

export function taskFailed(opts: RetryOptions) {
  return retryApi({}).taskFailed(opts);
}

export function permissions(opts: RetryOptions) {
  return retryApi({}).permissions(opts);
}

// TODO: All other utility functions got fixed moving from variable with arrow function to just function, but this one still throwing TS7056 error. It is related to recursive inferred typing
//
export function customError(error: string, opts: RetryOptions) {
  return retryApi({}).custom(error, opts);
}

function retryWrapper<T extends string>(state: IRetryConfig) { 
  return  <E extends string = "">(opts: RetryOptions, offset: string): IRetryApi<T | E> => {
    const newState = { ...state, [offset]: opts };
    return retryApi<T | E>(newState); 
  } 
}



// Tests
allErrors({}).permissions({}).runtime({}).dataLimitExceeded({}).taskFailed({}).timeout({}).custom("asdasda", {}).custom("asdasd", {})
allErrors({}).custom("", {}).dataLimitExceeded({});

const foo = permissions({}).dataLimitExceeded({}).allErrors({})

export type IRetryConfigurator<E extends string, T extends string = ""> = (opts:RetryOptions) => IRetryApi<E | T>;
export type IRetryCustomConfigurator<E extends string, T extends string = ""> = (customError: string, opts:RetryOptions) => IRetryApi<E | T>;

export type IRetryApi<E extends string> = Omit<{
  state: IRetryConfig;
  allErrors: IRetryConfigurator<E,'allErrors'>;
  runtime: IRetryConfigurator<E,'runtime'>;
  timeout: IRetryConfigurator<E,'timeout'>;
  dataLimitExceeded: IRetryConfigurator<E,'dataLimitExceeded'>;
  taskFailed: IRetryConfigurator<E,'taskFailed'>;
  permissions: IRetryConfigurator<E,'permissions'>;
  custom: IRetryCustomConfigurator<E>
}, E>

// const f = RetryConfig(api => api.allErrors({}).runtime({}).dataLimitExceeded({}).custom("", {}))

// function RetryConfig<T extends string = never>(api: (api: IRetryApi<"">) => IRetryApi<infer T>) {
//   const foo = api(retryApi({}))

//   return "state" in foo ? foo.state : undefined;
// }

export interface IRetryConfig {
  [errorTypes.all]?: RetryOptions;
  [errorTypes.dataLimitExceeded]?: RetryOptions;
  [errorTypes.permissions]?: RetryOptions;
  [errorTypes.runtime]?: RetryOptions;
  [errorTypes.taskFailed]?: RetryOptions;
  [errorTypes.timeout]?: RetryOptions;
  [custom: string]: RetryOptions;
}

function retryApi<TExclude extends string = "state">(state: Record<string, RetryOptions>) {
  const config = retryWrapper<TExclude>(state);
  return {
    state,
    allErrors(opts: RetryOptions) { return config<"allErrors">(opts, errorTypes.all) },
    runtime(opts: RetryOptions) { return config<"runtime">(opts, errorTypes.runtime) },
    timeout(opts: RetryOptions) { return config<"timeout">(opts, errorTypes.timeout) },
    dataLimitExceeded(opts: RetryOptions) { return config<"dataLimitExceeded">(opts, errorTypes.dataLimitExceeded) },
    taskFailed(opts: RetryOptions) { return config<"taskFailed">(opts, errorTypes.taskFailed) },
    permissions(opts: RetryOptions) { return config<"permissions">(opts, errorTypes.permissions) },
    custom<C extends string>(customError: C, opts: RetryOptions) { return config(opts, customError) },
  }
}

const conditionalRetryHandler = (state: Record<string, RetryOptions>) => (
  errorType: IErrorTypeSelector,
  options: RetryOptions,
) => {
  const newState = { ...state, [errorType(errorTypes)]: { ...options } }
  return {
    default: defaultRetryHandler(newState),
    handle: conditionalRetryHandler(newState),
    withoutDefault() {
      return newState
    },
  }
}

const defaultRetryHandler = (state: Record<string, RetryOptions>) => (options: RetryOptions) => {
  return {
    ...state,
    [errorTypes.all]: { ...options },
  }
}

/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * Allows to configure options to make our state to be executed again.
 *
 * @param handlerFn a callback that exposes methods to be used to defined an error retry handler.
 */
export function retryHandler(handlerFn: (r: IRetryHandlerApi) => Record<string, RetryOptions>) {
  const state: Record<string, RetryOptions> = {}
  const api: IRetryHandlerApi = {
    default: defaultRetryHandler(state),
    handle: conditionalRetryHandler(state),
  }

  return handlerFn(api)
}

/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * It let you continue to a fallback state or whatever user defined state such as `ErrorNotification`
 *
 * @param handlerFn a callback that exposes methods to be used to defined an error handler.
 */
export function errorHandler(handlerFn: (e: IErrHandlerApi) => Record<string, ErrDefn>) {
  const state: Record<string, ErrDefn> = {}
  const api: IErrHandlerApi = {
    default: defaultHandler(state),
    handle: conditionalHandler(state),
  }

  return handlerFn(api)
}

const conditionalHandler = (state: Record<string, ErrDefn>) => (
  errorType: IErrorTypeSelector,
  selector: IErrorHandlerPointer,
  resultPath: string = '$.error',
) => {
  const newState = { ...state, [errorType(errorTypes)]: { selector, resultPath } }
  return {
    default: defaultHandler(newState),
    handle: conditionalHandler(newState),
    withoutDefault() {
      return newState
    },
  }
}

const defaultHandler = (state: Record<string, ErrDefn>) => (
  selector: IErrorHandlerPointer,
  resultPath: string = '$.error',
) => {
  return {
    ...state,
    [errorTypes.all]: { selector, resultPath },
  }
}

function isState(obj: Finalized<IState> | IFinalizedStepFn): obj is Finalized<IState> {
  return 'type' in obj
}

function getFirstState(finalizedStepFn: IFinalizedStepFn) {
  const [firstState] = [...finalizedStepFn.getState()]

  if (!('name' in firstState)) {
    // TODO
    throw new ServerlessError(500, 'as', '')
  }
  return firstState.name
}
export function goToConfiguration(finalizedState: Finalized<IState> | IFinalizedStepFn | string): Finalized<IGoTo> {
  const hashState = hash(JSON.stringify(finalizedState))

  const next =
    typeof finalizedState === 'string' // is next state name
      ? finalizedState
      : isState(finalizedState) // is next state object
      ? finalizedState.name
      : getFirstState(finalizedState) // is finalized StepFn which has first state finalized

  return {
    type: 'GoTo',
    name: `goto-${hashState}`,
    next,
    isFinalized: true,
    isTerminalState: true,
  }
}

export function goTo(api: () => IConfigurableStepFn, commit: IStore['commit']) {
  return (finalizedState: Finalized<IState> | IFinalizedStepFn | string) => {
    commit(goToConfiguration(finalizedState))
    return api().finalize()
  }
}
