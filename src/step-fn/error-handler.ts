import { hash } from "native-dash";
import { ServerlessError } from "~/errors";
import {
  ErrDefn,
  IErrHandlerApi,
  IErrorHandlerPointer,
  IErrorTypeSelector,
  Finalized,
  IConfigurableStepFn,
  IErrorType,
  IFinalizedStepFn,
  IGoTo,
  IRetryHandlerApi,
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

const conditionalRetryHandler = (state: Record<string, RetryOptions>) => (
  errorType: IErrorTypeSelector,
  options: RetryOptions
) => {
  const newState = { ...state, [errorType(errorTypes)]: { ...options } };
  return {
    default: defaultRetryHandler(newState),
    handle: conditionalRetryHandler(newState),
    withoutDefault() {
      return newState;
    },
  };
};

const defaultRetryHandler = (state: Record<string, RetryOptions>) => (options: RetryOptions) => {
  return {
    ...state,
    [errorTypes.all]: { ...options },
  };
};

/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * Allows to configure options to make our state to be executed again.
 *
 * @param handlerFn a callback that exposes methods to be used to defined an error retry handler.
 */
export function retryHandler(handlerFunction: (r: IRetryHandlerApi) => Record<string, RetryOptions>) {
  const state: Record<string, RetryOptions> = {};
  const api: IRetryHandlerApi = {
    default: defaultRetryHandler(state),
    handle: conditionalRetryHandler(state),
  };

  return handlerFunction(api);
}

/**
 * Define how step function's errors or lambda fn execution errors are going to be handled with a fluent API syntax
 * It let you continue to a fallback state or whatever user defined state such as `ErrorNotification`
 *
 * @param handlerFn a callback that exposes methods to be used to defined an error handler.
 */
export function errorHandler(handlerFunction: (e: IErrHandlerApi) => Record<string, ErrDefn>) {
  const state: Record<string, ErrDefn> = {};
  const api: IErrHandlerApi = {
    default: defaultHandler(state),
    handle: conditionalHandler(state),
  };

  return handlerFunction(api);
}

const conditionalHandler = (state: Record<string, ErrDefn>) => (
  errorType: IErrorTypeSelector,
  selector: IErrorHandlerPointer,
  resultPath = "$.error"
) => {
  const newState = { ...state, [errorType(errorTypes)]: { selector, resultPath } };
  return {
    default: defaultHandler(newState),
    handle: conditionalHandler(newState),
    withoutDefault() {
      return newState;
    },
  };
};

const defaultHandler = (state: Record<string, ErrDefn>) => (selector: IErrorHandlerPointer, resultPath = "$.error") => {
  return {
    ...state,
    [errorTypes.all]: { selector, resultPath },
  };
};

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
