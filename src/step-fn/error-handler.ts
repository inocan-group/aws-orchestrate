/* eslint-disable no-use-before-define */
import { hash } from "native-dash";
import { ServerlessError } from "~/errors";
import {
  IErrorHandler,
  Finalized,
  IConfigurableStepFn,
  IErrorHandlerPointer,
  IErrorType,
  IFinalizedStepFn,
  IGoTo,
  IResultPath,
  IState,
  IStore,
  RetryOptions,
} from "~/types";
import { hasState } from "./type-guards";

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

/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * Allows to configure options to make our state to be executed again.
 *
 * @param api a callback that exposes methods to be used to defined an error retry handler.
 */
export function Retry<T extends string = never>(api: (api: IRetryApi<"">) => IRetryApi<T>) {
  const result = api(retryApi({})) as unknown as IRetryApi<"">;
  return result.state;
}

export type IRetryConfig = {
  [errorTypes.all]?: RetryOptions;
  [errorTypes.dataLimitExceeded]?: RetryOptions;
  [errorTypes.permissions]?: RetryOptions;
  [errorTypes.runtime]?: RetryOptions;
  [errorTypes.taskFailed]?: RetryOptions;
  [errorTypes.timeout]?: RetryOptions;
} & { [key: string]: RetryOptions };

export type IRetryConfigurator<E extends string, T extends string = ""> = (
  opts: RetryOptions
) => IRetryApi<E | T>;
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

export type ICatchConfigurator<T extends string> = (
  selector: IErrorHandlerPointer,
  resultPath?: Partial<IResultPath>
) => ICatchApi<T>;
export type ICatchCustomConfigurator<E extends string, T extends string = ""> = (
  customError: string,
  selector: IErrorHandlerPointer,
  resultPath?: Partial<IResultPath>
) => ICatchApi<E | T>;

export type ICatchApi<E extends string> = Omit<
  {
    state: ICatchConfig;
    allErrors: ICatchConfigurator<E | "allErrors">;
    runtime: ICatchConfigurator<E | "runtime">;
    timeout: ICatchConfigurator<E | "timeout">;
    dataLimitExceeded: ICatchConfigurator<E | "dataLimitExceeded">;
    taskFailed: ICatchConfigurator<E | "taskFailed">;
    permissions: ICatchConfigurator<E | "permissions">;
    custom: ICatchCustomConfigurator<E>;
  },
  E
>;

export type ICatchConfig = {
  [errorTypes.all]?: IErrorHandler;
  [errorTypes.dataLimitExceeded]?: IErrorHandler;
  [errorTypes.permissions]?: IErrorHandler;
  [errorTypes.runtime]?: IErrorHandler;
  [errorTypes.taskFailed]?: IErrorHandler;
  [errorTypes.timeout]?: IErrorHandler;
} & { [key: string]: IErrorHandler };

function catchApi<TExclude extends string = "state">(state: Record<string, IErrorHandler>) {
  const apiWrapper = <T extends string>(s: Record<string, IErrorHandler>, offset: string) => {
    return (selector: IErrorHandlerPointer, resultPath?: Partial<IResultPath>) => {
      const newState: Record<string, IErrorHandler> = { ...s, [offset]: { selector, resultPath } };
      return catchApi<T | TExclude>(newState) as unknown as ICatchApi<T | TExclude>;
    };
  };

  return {
    state,
    allErrors: apiWrapper<"allErrors">(state, errorTypes.all),
    runtime: apiWrapper<"runtime">(state, errorTypes.runtime),
    timeout: apiWrapper<"timeout">(state, errorTypes.timeout),
    dataLimitExceeded: apiWrapper<"dataLimitExceeded">(state, errorTypes.dataLimitExceeded),
    taskFailed: apiWrapper<"taskFailed">(state, errorTypes.taskFailed),
    permissionsapiWrapper: apiWrapper<"permissions">(state, errorTypes.permissions),

    custom<C extends string>(
      customError: C,
      selector: IErrorHandlerPointer,
      resultPath?: Partial<IResultPath>
    ) {
      return apiWrapper<typeof customError>(state, customError)(selector, resultPath);
    },
  } as unknown as ICatchApi<TExclude>;
}

/**
 * The builder API format provided to a consumer of this library. It's intention
 * is to allow the user to configure a error handler. For example:
 *
 * ```ts
 * const handler = Catch(h => h.allErrors(s => s.task('foobar')));
 * ```
 *
 * where the consumer is providing the content within the `Catch()` function.
 */
export type ICatchApiBuilder<TExclude extends string = never> = (
  api: ICatchApi<TExclude>
) => ICatchApi<string>;

export type IRetryFluentApi<T extends string = never> = (api: IRetryApi<"">) => IRetryApi<T>;

/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * It let you continue to a fallback state or whatever user defined state such as `ErrorNotification`
 *
 * @param api a callback that exposes methods to be used to defined an error handler.
 */
export function Catch<TExclude extends string = never>(api: ICatchApiBuilder<TExclude>) {
  const handler = api(catchApi({}));
  if (hasState(handler)) {
    return handler.state;
  } else {
    throw new Error("Catch recieved an invalid return; needs an object with 'state'");
  }
}

function retryWrapper<T extends string>(state: IRetryConfig) {
  return <E extends string = "">(opts: RetryOptions, offset: string): IRetryApi<T | E> => {
    const newState = { ...state, [offset]: opts };
    return retryApi<T | E>(newState);
  };
}

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

export function goToConfiguration(
  finalizedState: Finalized<IState> | IFinalizedStepFn | string
): Finalized<IGoTo> {
  const hashState = hash(JSON.stringify(finalizedState));

  const next =
    typeof finalizedState === "string" // is next state name
      ? finalizedState
      : isState(finalizedState) // is next state object
      ? finalizedState.name
      : getFirstState(finalizedState); // is finalized StepFn which has first state finalized

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
