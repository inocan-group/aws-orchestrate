import { ServerlessError } from "~/errors";
import {
  CallableConfiguration,
  Finalized,
  IConfigurableStepFn,
  IFinalizedStepFn,
  IFluentApi,
  IState,
  IStepFn,
  IStepFnOptions,
  IStepFnSelector,
} from "~/types";
import { goTo } from "..";
import { choice, fail, map, parallel, pass, succeed, task, wait } from "../states";

export const isFluentApi = (obj: IStepFnSelector): obj is IFluentApi => !isStepFunction(obj) && !Array.isArray(obj);
export function isStepFunction(obj: IStepFnSelector): obj is IStepFn {
  return "getState" in obj || "finalize" in obj;
}
export const isFinalizedStepFn = (obj: IStepFn): obj is IFinalizedStepFn => "getState" in obj;
export const isStateDefn = (obj: IState | IStepFnOptions): obj is IState => obj !== undefined && "type" in obj;

export function StepFunction(...params: (IState | Finalized<IState> | IStepFnOptions)[]) {
  const defaultOptions = {
    autoIndexNames: false,
  };

  let state: Array<IState | Finalized<IState>> = [];

  const commit = <T extends IState>(payload: T) => {
    const tail = state[state.length - 1];
    if (state.length > 0 && tail && tail.isTerminalState) {
      throw new ServerlessError(400, "Not allowed to extend already finalized step function", "not-allowed");
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

  function configuring(options: IStepFnOptions): IConfigurableStepFn {
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

// export function finalizeStates<T extends IState>(
//   states: (Finalized<T> | T)[],
//   options: IStepFnOptions,
// ): Finalized<T>[] {
//   const lastIndex = states.length - 1
//   return states.map((state, index) => {
//     if (isFinalizedState(state)) {
//       return { ...state, isTerminalState: lastIndex === index }
//     } else {
//       const hashState = hash(JSON.stringify(state))

//       return {
//         ...state,
//         name:
//           state.type === 'Task'
//             ? `${options.namePrefix || ''}${parseArn((state as ITask).resource).fn}`
//             : `${options.namePrefix || ''}${state.type}-${hashState}`,
//         isFinalized: true,
//         isTerminalState: lastIndex === index,
//       }
//     }
//   })
// }

// function isFinalizedState<T extends IState>(state: Finalized<T> | T): state is Finalized<T> {
//   return state.isFinalized
// }
