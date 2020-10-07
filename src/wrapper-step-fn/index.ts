import { IStepFunctionType } from 'common-types'
import {
  IMap,
  IStateDefn,
  ITask,
  IStepFunctionWrapper,
  StateWrapper,
  IStepFunctionDeployableApi, 
  IStateMachineApi, 
  ISuccess, 
  IStepFunction, IFail, IStepFunctionApi, IStepFnOptions, IChoice
} from './types'
import crypto from "crypto"

const randomId = () => crypto.randomBytes(20).toString('hex');

const task: StateWrapper<ITask> = (api, store) => (name, options) => {
  store.commit('Task', { resourceName: name, id: randomId(), ...options })
  
  return api()
}

const success: StateWrapper<ISuccess> = (_, store) => () => {
  store.commit('Succeed', { id: randomId() })
  return {
    ...store
  }
}

const fail: StateWrapper<IFail> = (_, store) => (reason) => {
  store.commit('Fail', { id: randomId() })
  return {
    ...store
  }
}

const map: StateWrapper<IMap> = (api, store) => (itemsPath, options) => {
  return {
    use: cb => {
      /**
       * Creates new step fn and retrieves its state to commit to the parent step fn
       */
      const mapStepFunction = cb(StepFunction())
      
      store.commit("Map", ...mapStepFunction.getState())

      return api()
    },
  }
}

export const choice: StateWrapper<IChoice> = (api, store) => (branches, options) => {
  branches.forEach(b => {
    const branchStepFn = b.sf(StepFunction())
    store.commit("Choice", ...branchStepFn.getState())
  })

  return {...store}
}


  // state = [ {t1}, {t2}, { c1 }, [sf2], [sf3] ]


  // StateDfn, [StateDfn, StateDfn, StateDfn, StateDfn, StateDfn, StateDfn], StateDfn ]

  // sf: t, t, m, c |END
  // choice, success, fail

  // sf1 -> (s2, s3) -> t -> (s4, s5)
  // sf1 -> (s2 -> s4, s3)

export const StepFunction: IStepFunction = options => {
  const state: IStateDefn[] = []

  const defaultOptions = {
    autoIndexNames: false,
  }

  const commit = (type: IStepFunctionType, ...payload: IStateDefn[]) => {

    // Creates relationship using the prior step's `Next` property. 
    // TODO: Search a better way of make sure of sorting properly.
    const rest = payload?.map((p, index) => {
      const nextIndex = index + 1;
      
      return {
        ...p,
        next: nextIndex in payload ? payload[nextIndex].id : undefined
      }
    });
    const firstElement = rest.shift()

    if (state.length > 0) {
      state[state.length - 1].next = firstElement.id
    }

    // TODO: It should be handled different in order to make flatten array of state definition with the right sequence
    switch(type) {
      case "Choice":
        state.push(firstElement, ...rest)
      case "Map":
        state.push(firstElement, ...rest)
      default:
        state.push(firstElement, ...rest)
    }
  }

  const getState = () => {
    return state
  }

  const store = {
    commit,
    getState
  }
  return StepFunctionWrapper({...defaultOptions, ...options})(store)
}

export const StepFunctionWrapper: IStepFunctionWrapper = options => store => {
  
  const api: (options: IStepFnOptions) => IStepFunctionApi = (options) => {
    return {
      task: task(() => api(options), store),
      success: success(() => api(options), store),
      map: map(() => api(options), store),
      fail: fail(() => api(options), store)
    }
  }

  return api(options)
}

export const StateMachine = (name: string, stepFunction: IStepFunctionDeployableApi): IStateMachineApi => {

  // TODO: Parse IStepFunctionDeployableApi's state into `IStateMachine`
 const definition = stepFunction.getState() as any
 
  return {
    toYaml() {
      return "foo"
    },
    generate() {
      return {
        name,
        definition
      }
    }
  }
}