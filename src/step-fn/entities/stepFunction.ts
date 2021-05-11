import { ServerlessError } from "~/errors";
import {
  CallableConfiguration,
  Finalized,
  ICatchConfigurableStepFn,
  ICatchFluentStepFnApi,
  IConfigurableStepFn,
  IErrorHandlerPointer,
  IFinalizedStepFn,
  IState,
  IStepFn,
  IStepFnOptions,
  IStepFnSelector,
  IStepFnFluentApi,
} from "~/types";
import { goTo } from "..";
import { choiceWrapper, failWrapper, mapWrapper, parallelWrapper, passWrapper, succeedWrapper, taskWrapper, waitWrapper } from "../states";

export const isFluentApi = (
  obj: IStepFnSelector | IErrorHandlerPointer
): obj is IStepFnFluentApi | ICatchFluentStepFnApi => !isStepFunction(obj) && !Array.isArray(obj);

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
  for (const param of params) {
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
    const configure = <T>(fn: CallableConfiguration<T>) => fn(() => configuring(options), commit);

    return {
      state,
      task: configure(taskWrapper),
      succeed: configure(succeedWrapper),
      map: configure(mapWrapper),
      fail: configure(failWrapper),
      choice: configure(choiceWrapper),
      wait: configure(waitWrapper),
      parallel: configure(parallelWrapper),
      pass: configure(passWrapper),
      goTo: configure(goTo),
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
