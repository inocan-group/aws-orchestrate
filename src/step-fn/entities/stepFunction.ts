import { ServerlessError } from "~/errors";
import {
  CallableConfiguration,
  Finalized,
  ICatchConfigurableStepFn,
  ICatchFluentStepFnApi,
  IConfigurableStepFn,
  IErrorHandlerPointer,
  IFinalizedStepFn,
  IFluentApi,
  IState,
  IStepFn,
  IStepFnOptions,
  IStepFnSelector,
} from "~/types";
import { goTo } from "..";
import { choice, fail, map, parallel, pass, succeed, task, wait } from "../states";

export const isFluentApi = (
  obj: IStepFnSelector | IErrorHandlerPointer
): obj is IFluentApi | ICatchFluentStepFnApi => !isStepFunction(obj) && !Array.isArray(obj);
export function isStepFunction(obj: IStepFnSelector | IErrorHandlerPointer): obj is IStepFn {
  return "getState" in obj || "finalize" in obj;
}
export const isFinalizedStepFn = (obj: IStepFn): obj is IFinalizedStepFn => "getState" in obj;
export const isStateDefn = (obj: IState | IStepFnOptions): obj is IState =>
  obj !== undefined && "type" in obj;

export type IStepFnState = IState | Finalized<IState>;

/**
 *
 * @param params instances of `IState` passed separated by comma. Optionally, it accepts a hash (`IStepFnOptions`) as the last parameter
 *
 * @returns `IConfigurableStepFn | ICatchConfigurableStepFn`
 */
export function StepFunction(...params: IStepFnState[] | [...IStepFnState[], IStepFnOptions]) {
  const defaultOptions = {
    autoIndexNames: false,
  };

  let state: Array<IStepFnState> = [];

  const commit = <T extends IState>(payload: T) => {
    const tail = state[state.length - 1];
    if (state.length > 0 && tail && tail.isTerminalState) {
      throw new ServerlessError(
        400,
        "Not allowed to extend already finalized step function",
        "not-allowed"
      );
    }

    state = [...state, payload];
  };

  let options: IStepFnOptions = {};
  for (const param of params as T) {
    if (isStateDefn(param)) {
      commit(param);
    } else {
      options = param;
    }
  }

  const getOptions = () => {
    return options;
  };

  function configuring(options: IStepFnOptions): IConfigurableStepFn | ICatchConfigurableStepFn {
    const callable = <T>(fn: CallableConfiguration<T>) => fn(() => configuring(options), commit);

    return {
      state,
      task: callable(task),
      succeed: callable(succeed),
      map: callable(map),
      fail: callable(fail),
      choice: callable(choice),
      wait: callable(wait),
      parallel: callable(parallel),
      pass: callable(pass),
      goTo: callable(goTo),
      finalize() {
        const lastIndex = state.length - 1;
        state = state.map((s, index) => {
          return { ...s, isTerminalState: lastIndex === index };
        }) as IState[];
        return { getState: () => state, getOptions };
      },
    };
  }

  return configuring({ ...defaultOptions, ...options });
}
