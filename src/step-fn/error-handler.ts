/* eslint-disable no-use-before-define */
import { hash } from "native-dash";
import { ServerlessError } from "~/errors";
import {
  ErrDefn,
  Finalized,
  IConfigurableStepFn,
  IErrorType,
  IFinalizedStepFn,
  IGoTo,
  IState,
  IStore,
  RetryOptions,
} from "~/types";

/**
 * Step Function Errors
 *
 * [AWS Documentation](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)
 */
export const errorTypes: IErrorType = {
  all: "States.ALL",
  runtime: "States.Runtime",
  timeout: "States.Timeout",
  dataLimitExceeded: "States.DataLimitExceeded",
  taskFailed: "States.TaskFailed",
  permissions: "States.Permissions",
  custom(error: string) {
    return error;
  },
};

export function RetryConfig<T extends string = never>(api: (api: IRetryApi<"">) => IRetryApi<T>) {
  const result = (api(retryApi({})) as unknown) as IRetryApi<"">;
  return result.state;
}

export type IRetryConfig = {
  [errorTypes.all]?: RetryOptions;
  [errorTypes.dataLimitExceeded]?: RetryOptions;
  [errorTypes.permissions]?: RetryOptions;
  [errorTypes.runtime]?: RetryOptions;
  [errorTypes.taskFailed]?: RetryOptions;
  [errorTypes.timeout]?: RetryOptions;
} & { [key: string]: RetryOptions};

export type IRetryConfigurator<E extends string, T extends string = ""> = (opts: RetryOptions) => IRetryApi<E | T>;
export type IRetryCustomConfigurator<E extends string, T extends string = ""> = (
  customError: string,
  opts: RetryOptions
) => IRetryApi<E | T>;

export type IRetryApi<E extends string> = Omit<
  {
    state: IRetryConfig;
    allErrors: IRetryConfigurator<E, "allErrors">;
    runtime: IRetryConfigurator<E, "runtime">;
    timeout: IRetryConfigurator<E, "timeout">;
    dataLimitExceeded: IRetryConfigurator<E, "dataLimitExceeded">;
    taskFailed: IRetryConfigurator<E, "taskFailed">;
    permissions: IRetryConfigurator<E, "permissions">;
    custom: IRetryCustomConfigurator<E>;
  },
  E
>;

function retryApi<T extends string = "state">(state: Record<string, RetryOptions>) {
  const config = retryWrapper<T>(state);
  return {
    state,
    allErrors(opts: RetryOptions) {
      return config<"allErrors">(opts, errorTypes.all);
    },
    runtime(opts: RetryOptions) {
      return config<"runtime">(opts, errorTypes.runtime);
    },
    timeout(opts: RetryOptions) {
      return config<"timeout">(opts, errorTypes.timeout);
    },
    dataLimitExceeded(opts: RetryOptions) {
      return config<"dataLimitExceeded">(opts, errorTypes.dataLimitExceeded);
    },
    taskFailed(opts: RetryOptions) {
      return config<"taskFailed">(opts, errorTypes.taskFailed);
    },
    permissions(opts: RetryOptions) {
      return config<"permissions">(opts, errorTypes.permissions);
    },
    custom<C extends string>(customError: C, opts: RetryOptions) {
      return config(opts, customError);
    },
  };
}

export type ICatchConfigurator<E extends string, T extends string = ""> = (opts: ErrDefn) => ICatchApi<E | T>;
export type ICatchCustomConfigurator<E extends string, T extends string = ""> = (
  customError: string,
  opts: ErrDefn
) => ICatchApi<E | T>;

export type ICatchApi<E extends string> = Omit<
  {
    state: ICatchConfig;
    allErrors: ICatchConfigurator<E, "allErrors">;
    runtime: ICatchConfigurator<E, "runtime">;
    timeout: ICatchConfigurator<E, "timeout">;
    dataLimitExceeded: ICatchConfigurator<E, "dataLimitExceeded">;
    taskFailed: ICatchConfigurator<E, "taskFailed">;
    permissions: ICatchConfigurator<E, "permissions">;
    custom: ICatchCustomConfigurator<E>;
  },
  E
>;

function catchWrapper<T extends string>(state: Record<string, ErrDefn>) {
  return <E extends string = "">(opts: ErrDefn, offset: string): ICatchApi<T | E> => {
    const newState = { ...state, [offset]: opts };
    return catchApi<T | E>(newState);
  };
}

export type ICatchConfig = {
  [errorTypes.all]?: ErrDefn;
  [errorTypes.dataLimitExceeded]?: ErrDefn;
  [errorTypes.permissions]?: ErrDefn;
  [errorTypes.runtime]?: ErrDefn;
  [errorTypes.taskFailed]?: ErrDefn;
  [errorTypes.timeout]?: ErrDefn;
} & { [key: string]: ErrDefn};

function catchApi<T extends string = "state">(state: Record<string, ErrDefn>) {
  const config = catchWrapper<T>(state);
  return {
    state,
    allErrors(opts: ErrDefn) {
      return config<"allErrors">(opts, errorTypes.all);
    },
    runtime(opts: ErrDefn) {
      return config<"runtime">(opts, errorTypes.runtime);
    },
    timeout(opts: ErrDefn) {
      return config<"timeout">(opts, errorTypes.timeout);
    },
    dataLimitExceeded(opts: ErrDefn) {
      return config<"dataLimitExceeded">(opts, errorTypes.dataLimitExceeded);
    },
    taskFailed(opts: ErrDefn) {
      return config<"taskFailed">(opts, errorTypes.taskFailed);
    },
    permissions(opts: ErrDefn) {
      return config<"permissions">(opts, errorTypes.permissions);
    },
    custom<C extends string>(customError: C, opts: ErrDefn) {
      return config(opts, customError);
    },
  };
}

export type ICatchFluentApi<T extends string = never> = (api: ICatchApi<"">) => ICatchApi<T>;
export type IRetryFluentApi<T extends string = never> = (api: IRetryApi<"">) => IRetryApi<T>;

export function CatchConfig<T extends string = never>(api: ICatchFluentApi<T>) {
  const result = (api(catchApi({})) as unknown) as ICatchApi<"">;
  return result.state;
}

function retryWrapper<T extends string>(state: IRetryConfig) {
  return <E extends string = "">(opts: RetryOptions, offset: string): IRetryApi<T | E> => {
    const newState = { ...state, [offset]: opts };
    return retryApi<T | E>(newState);
  };
}

/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * Allows to configure options to make our state to be executed again.
 *
 * @param handlerFn a callback that exposes methods to be used to defined an error retry handler.
 */


/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * It let you continue to a fallback state or whatever user defined state such as `ErrorNotification`
 *
 * @param handlerFn a callback that exposes methods to be used to defined an error handler.
 */

function isState(object: Finalized<IState> | IFinalizedStepFn): object is Finalized<IState> {
  return "type" in object;
}

function getFirstState(finalizedStepFunction: IFinalizedStepFn) {
  const [firstState] = [...finalizedStepFunction.getState()];

  if (!("name" in firstState)) {
    // TODO
    throw new ServerlessError(500, "as", "");
  }

  return firstState.name;
}
export function goToConfiguration(finalizedState: Finalized<IState> | IFinalizedStepFn | string): Finalized<IGoTo> {
  const hashState = hash(JSON.stringify(finalizedState));

  const next =
    typeof finalizedState === "string" // is next state name
      ? finalizedState
      : (isState(finalizedState) // is next state object
      ? finalizedState.name
      : getFirstState(finalizedState)); // is finalized StepFn which has first state finalized

  return {
    type: "GoTo",
    name: `goto-${hashState}`,
    next,
    isFinalized: true,
    isTerminalState: true,
  };
}

export function goTo(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (finalizedState: Finalized<IState> | IFinalizedStepFn | string) => {
    commit(goToConfiguration(finalizedState));
    return api().finalize();
  };
}
