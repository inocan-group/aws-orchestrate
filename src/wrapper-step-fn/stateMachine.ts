import {
  IDictionary,
  IStepFunctionTask,
  IStepFunctionSucceed,
  IStepFunctionFail,
  IStepFunctionMap,
  IStepFunctionStep,
  IStateMachine,
  IStepFunctionChoice,
  IStepFunctionCatcher,
  IStepFunction,
} from 'common-types'
import { dump } from 'js-yaml'
import { randomString } from 'native-dash'
import {
  IStateMachineApi,
  ITask,
  ISucceed,
  IFail,
  IMap,
  IChoice,
  IState,
  IStateMachineFactory,
  isFinalizedStepFn,
  Finalized,
} from '.'
import { parseArn } from '../invoke'
import { parseAndFinalizeStepFn } from './state'
import { finalizeStates, isFluentApi, isStepFunction } from './stepFunction'
import {
  ConditionalHandler,
  DefaultErrorHandler,
  IErrorHandlerPointer,
  IFinalizedStepFn,
  IStepFnOptions,
  IStepFnSelector,
  Result,
} from './types'
import { hash } from 'native-dash'

export const isFinalizedState = <T extends IState>(obj: T | Finalized<T>): obj is Finalized<T> => 'name' in obj && obj.name !== undefined

const randomId = (namePrefix: string) => {
  return `${namePrefix}-${randomString()}`
}
function toCammelCase(object: any) {
  return Object.keys(object).reduce((acc, key) => {
    let val = object[key]
    if (typeof val === 'object') {
      val = toCammelCase(val)
    }
    const cammelCaseKey = key.replace(/(\w)(\w*)/g, (_, g1, g2) => `${g1.toUpperCase()}${g2.toLowerCase()}`)
    acc[cammelCaseKey] = val
    return acc
  }, {} as any)
}

export const StateMachine: IStateMachineFactory = (name, params): IStateMachineApi => {
  const resultStates: [string, IStepFunctionStep][] = []
  const errorHandlerStates: [string, IStepFunctionStep][] = []

  /**
   * TODO: It will be used to validate not permited usage of finalized StepFn and States
   */
  const cachedStepFn: Record<string, IFinalizedStepFn> = {}
  const cachedStates: Record<string, Finalized<IState>> = {}

  const { stepFunction, defaultErrorHandler } = params
  const finalizedStepFn = isFinalizedStepFn(stepFunction) ? stepFunction : stepFunction.finalize()
  const hashStepFn = hash(JSON.stringify(finalizedStepFn.getState()))
  cachedStepFn[hashStepFn] = finalizedStepFn

  function parseStepFunction(state: Result<IState>[], options: IStepFnOptions) {

    function parseTask(stateDefn: ITask | Finalized<ITask>, options: IStepFnOptions) {
      const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)
      const { catch: stateErrorHandler, ...rest } = finalizedState
      const hashState = hash(JSON.stringify(finalizedState))
      cachedStates[hashState] = finalizedState

      const name = `${options.namePrefix || ''}${
        isFinalizedState(stateDefn) ? stateDefn.name : parseArn(stateDefn.resource).fn
      }`

      const errorHandler = stateErrorHandler || options.defaultErrorHandler

      resultStates.push([
        name,
        {
          ...toCammelCase(rest),
          name,
          Catch: errorHandler ? parseErrorHandler(errorHandler, hashState) : undefined,
        },
      ])
    }

    function parseSucceed(stateDefn: Result<ISucceed>, options: IStepFnOptions) {
      const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)

      const hashState = hash(JSON.stringify(finalizedState))
      cachedStates[hashState] = finalizedState

      resultStates.push([
        `${options.namePrefix || ''}${stateDefn.name || 'succeed'}`,
        {
          Type: 'Succeed',
          Comment: finalizedState.comment,
        },
      ])
    }

    function parseFail(stateDefn: IFail, options: IStepFnOptions) {
      const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)

      const hashState = hash(JSON.stringify(finalizedState))
      cachedStates[hashState] = finalizedState

      resultStates.push([`${options.namePrefix || ''}${stateDefn.name ? stateDefn.name : `fail-${hashState}`}`, {
          Type: 'Fail',
          Cause: finalizedState.cause,
          Comment: finalizedState.comment,
        },
      ])
    }

    function isConditionalErrorHandler(obj: IErrorHandlerPointer | ConditionalHandler): obj is ConditionalHandler {
      return (
        typeof obj === 'object' && Object.values(obj).some(o => isStepFunction(o) || isFluentApi(o) || Array.isArray(o))
      )
    }

    function parseErrorHandler(errorHandler: DefaultErrorHandler, hashParent: number): IStepFunctionCatcher[] {
      let errorHandlers: IStepFunctionCatcher[] = []
      if (isConditionalErrorHandler(errorHandler)) {
        for (const [errorType, handler] of Object.entries(errorHandler)) {
          let finalizedStepFn = parseAndFinalizeStepFn(handler)

          const stepFn = parseStepFunction(finalizedStepFn.getState(), { ...finalizedStepFn.getOptions() })

          for (const [stateName, state] of Object.entries(stepFn.States)) {
            errorHandlerStates.push([stateName, state])
          }

          const [[next, _]] = Object.entries(stepFn.States)

          errorHandlers.push({
            ErrorEquals: [errorType],
            Next: next,
          })
        }
      }
      return errorHandlers
    }

    function parseMap(stateDefn: IMap, options: IStepFnOptions) {
      const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)
      const { catch: stateErrorHandler, deployable: stepFn, name: _, ...rest } = finalizedState

      const hashState = hash(JSON.stringify(finalizedState))

      cachedStates[hashState] = finalizedState

      const Iterator = parseStepFunction(stateDefn.deployable.getState(), {
        ...options,
        ...stateDefn.deployable.getOptions(),
      })
      const errorHandler = stateErrorHandler || options.defaultErrorHandler

      resultStates.push(
        [`${options.namePrefix || ''}${name ? name : `map-${hashState}`}`, {
          ...toCammelCase(rest),
          Iterator,
          Catch: errorHandler ? parseErrorHandler(errorHandler, hashState) : undefined,
        }]
      )
    }

    function parseChoice(stateDefn: IChoice, options: IStepFnOptions) {
      let States: IStepFunctionStep = {},
        Choices: IStepFunctionChoice[] = []

      stateDefn.choices?.forEach(c => {
        const { finalizedStepFn, ...rest } = c

        parseStepFunction(finalizedStepFn.getState(), { ...options, ...finalizedStepFn.getOptions() })

        const parsedStates = finalizedStepFn.getState().map(s => {
          return {
            ...toCammelCase(s),
            Name: `${finalizedStepFn.getOptions().namePrefix ?? options.namePrefix}${name ? name : randomId(s.type)}`,
          }
        })
        States = { ...States, ...parsedStates }
        const nextState = Object.keys(parsedStates).shift()

        return {
          ...toCammelCase(rest),
          Next: nextState,
        }
      })

      for (const [stateName, state] of Object.entries(States)) {
        resultStates.push([stateName, state])
      }

      resultStates.push(
        [`${options.namePrefix || ''}${name ? name : randomId('choice')}`, {
          Type: 'Choice',
          Choices,
        }])
    }

    
    state.forEach(
      (stateDefn) => {
        switch (stateDefn.type) {
          case 'Task':
            parseTask(stateDefn, options)
            break
          case 'Succeed':
            parseSucceed(stateDefn, options)
            break
          case 'Fail':
            parseFail(stateDefn, options)
            break
          case 'Map':
            parseMap(stateDefn, options)
            break
          case 'Choice':
            parseChoice(stateDefn, options)
            break
          default:
        }
      },
      {
        States: {},
      } as IStepFunction,
    )
    

    const stepFunctionDefn = resultStates.reduce((acc: IDictionary<IStepFunctionStep>, curr, index) => {
      const [stateName, stateDefn] = curr

      console.log(curr)
      acc[stateName] = stateDefn

      const hasNextState = index + 1 in resultStates
      if (hasNextState) {
        (acc[stateName] as any).Next = resultStates[index + 1][0]
      }

      return acc
    }, {})

    const errorHandler = errorHandlerStates.reduce((acc: IDictionary<IStepFunctionStep>, curr, index) => {
      const [stateName, stateDefn] = curr

      acc[stateName] = stateDefn

      const hasNextState = index + 1 in resultStates
      if (hasNextState) {
        (acc[stateName] as any).Next = resultStates[index + 1][0]
      }

      return acc
    }, {})

    console.log(stepFunctionDefn)

    return {
      States: {...stepFunctionDefn, ...errorHandler},
      StartAt: resultStates[0][0]
    }
  }


  const definition = parseStepFunction(finalizedStepFn.getState(), {
    defaultErrorHandler,
    ...finalizedStepFn.getOptions(),
  })

  const stateMachine = {
    name,
    definition,
  }

  return {
    toYaml() {
      return dump(stateMachine)
    },
    toJSON() {
      console.log(stateMachine)
      return stateMachine
    },
    visualize() {
      // TODO:
      return {}
    },
  }
}

function buildSequence() {
  throw 'foo'
}
