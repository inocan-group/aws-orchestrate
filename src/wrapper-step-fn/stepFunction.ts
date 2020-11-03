import {
  IState,
  IStepFnOptions,
  IConfigurableStepFn,
  task,
  succeed,
  map,
  choice,
  fail,
  IFluentApi,
  IStepFnSelector,
  IStepFn,
  CallableConfiguration,
  wait,
  Finalized,
} from '.'
import { parallel } from './parallel'
import { pass } from './pass'
import { succeedConfiguration } from './succeed'
import { hash } from 'native-dash'

export const isFluentApi = (obj: IStepFnSelector): obj is IFluentApi => !isStepFunction(obj) && !Array.isArray(obj)
export function isStepFunction(obj: IStepFnSelector): obj is IStepFn {
  return 'getState' in obj || 'finalize' in obj
}
// export const isFinalizedStepFn = (obj: IStepFn): obj is IFinalizedStepFn => 'getState' in obj
export const isStateDefn = (obj: IState | IStepFnOptions): obj is IState => obj !== undefined && 'type' in obj

export function StepFunction<T extends IState | Finalized<IState>>(...params: (T | IStepFnOptions)[]) {
  const defaultOptions = {
    autoIndexNames: false,
  }

  let state: Array<IState | Finalized<IState> | T> = []

  const commit = (payload: T) => {
    if (payload.isTerminalState) {
      state = [...state, payload]
    }
    state = [...state, payload]
  }

  let options: IStepFnOptions = {}
  params.forEach(param => {
    if (isStateDefn(param)) {
      commit(param)
    } else {
      options = param
    }
  })

  const getOptions = () => {
    return options
  }

  // TODO: Identify the type that expects last array element be FinalizedState

  function configuring<TResult extends IState | Finalized<IState> = T>(options: IStepFnOptions): IConfigurableStepFn<TResult> {

    const callable = <T2, T4 extends IState | Finalized<IState>>(fn: CallableConfiguration<T2, T4>) =>
      fn(() => configuring<T4>(options), commit)

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
      finalize() {
        const tail = state.pop()
        
        if (tail == undefined) {
          throw Error("There must be at least one state to finalize the step function")
        }
        
        if (tail && tail.isTerminalState) {
          state = [...state, tail]
        } else if (tail) {
          state = [...state, tail, succeedConfiguration('succeed')]
        }
        state = finalizeStates(state, getOptions())
        return { getState: () => state, getOptions }
      },
    }
  }

  return configuring({ ...defaultOptions, ...options })
}

export function finalizeStates<T extends IState>(states: (Finalized<T> | T)[], options: IStepFnOptions): Finalized<T>[] {
  return states.map(state => {
    if (isFinalizedState(state)) {
      return state
    } else {
      const hashState = hash(JSON.stringify(state))
      return {
        ...state,
        name: `${options.namePrefix || ''}${state.type}-${hashState}`,
        isFinalized: true,
      }
    }
  })
}

function isFinalizedState<T extends IState>(state: Finalized<T> | T): state is Finalized<T> {
  return state.isFinalized
}