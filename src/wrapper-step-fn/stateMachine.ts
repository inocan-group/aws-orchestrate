import {
  IDictionary,
  IStepFunctionTask,
  IStepFunctionSucceed,
  IStepFunctionFail,
  IStepFunctionMap,
  IStepFunctionStep,
  IStepFunctionChoice,
  IStepFunctionCatcher,
  IStepFunction,
  IStepFunctionChoiceItem,
  IStepFunctionWait,
  IStepFunctionPass,
  IStepFunctionParallel,
  IStepFunctionType,
} from 'common-types'
import { dump } from 'js-yaml'
import {
  IStateMachineApi,
  ITask,
  ISucceed,
  IFail,
  IMap,
  IChoice,
  IState,
  IStateMachineFactory,
  Finalized,
  IFinalizedStepFn,
  finalizeStates,
  IStepFnOptions,
  parseArn,
  parseAndFinalizeStepFn,
  ServerlessError,
  Result,
  isFinalizedStepFn,
  IParallel,
  IPass,
  IWait,
  IGoTo,
  ErrDefn,
  parseStepFnSelector,
} from '../private'
import { hash } from 'native-dash'
import { StringBuilder } from 'lzutf8'

const cachedStepFn: Record<number, IFinalizedStepFn> = {}
export const isFinalizedState = <T extends IState>(obj: T | Finalized<T>): obj is Finalized<T> =>
  'name' in obj && obj.name !== undefined

const notAllowedKeys = ['Name', 'IsFinalized', 'IsTerminalState']
const defaultExcluding = ['parameters']

function toCammelCase<T = {}>(object: any, skip = false) {
  const result = Object.keys(object).reduce((acc, key) => {
    let val = object[key]
    if (typeof val === 'object' && !defaultExcluding.includes(key)) {
      val = toCammelCase(val)
    } else if (typeof val === 'object' && defaultExcluding.includes(key)) {
      val = toCammelCase(val, true)
    }

    if (!skip) {
      const [firstLetter, ...rest] = key
      const cammelCase = `${firstLetter.toUpperCase()}${rest.join('')}`

      if (!notAllowedKeys.includes(cammelCase)) {
        acc[cammelCase] = val
      }
    } else {
      acc[key] = val
    }
    return acc
  }, {} as any)

  return result
}

const parseTask = (ctx: ICtx) => (stateDefn: ITask | Finalized<ITask>, options: IStepFnOptions) => {
  const [finalizedState] =
    stateDefn.isFinalized == true && 'name' in stateDefn ? [stateDefn] : finalizeStates([stateDefn], options)
  const { catch: stateErrorHandler, retry, ...rest } = finalizedState
  const name = `${options.namePrefix || ''}${
    isFinalizedState(stateDefn) ? stateDefn.name : parseArn(stateDefn.resource).fn
  }`

  const errorHandler = stateErrorHandler || options.defaultErrorHandler
  let errorHandlerResult: IStepFunctionCatcher[]

  if (errorHandler !== undefined) {
    const aggregate = Object.keys(errorHandler).map(k => parseErrorHandler(ctx)(k, errorHandler[k]))
    const errorStatesTuple: [string, IStepFunctionStep][] = aggregate.reduce((acc, curr) => {
      const k = Object.keys(curr[1]).map(c => [c, curr[1][c]] as [string, IStepFunctionStep])
      acc = [...acc, ...k]
      return acc
    }, [] as [string, IStepFunctionStep][])
    ctx.errorHandlerStates.push(...errorStatesTuple)
    errorHandlerResult = aggregate.reduce((acc, curr) => {
      acc = [...acc, ...curr[0]]
      return acc
    }, [])
  }

  const End = finalizedState.isTerminalState ? true : undefined

  const state: [string, IStepFunctionStep] = [
    name,
    {
      ...toCammelCase<IStepFunctionTask>(rest),
      Catch: errorHandlerResult,
      Retry: retry
        ? Object.keys(retry).reduce((acc, curr) => {
            acc = [...acc, { ErrorEquals: [curr], ...toCammelCase(retry[curr]) }]
            return acc
          }, [])
        : undefined,
      End,
    },
  ]

  ctx.validateState(finalizedState)
  ctx.definitionStates.push(state)
}

const parseSucceed = (ctx: ICtx) => (stateDefn: Result<ISucceed>, options: IStepFnOptions) => {
  const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)

  ctx.definitionStates.push([
    `${options.namePrefix || ''}${finalizedState.name || `succeed-${ctx.hashState}`}`,
    {
      Type: 'Succeed',
      Comment: finalizedState.comment,
    },
  ])
}

const parseFail = (ctx: ICtx) => (stateDefn: IFail | Finalized<IFail>, options: IStepFnOptions) => {
  const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)

  ctx.definitionStates.push([
    `${options.namePrefix || ''}${finalizedState.name ? finalizedState.name : `fail-${ctx.hashState}`}`,
    {
      Type: 'Fail',
      Cause: finalizedState.cause,
      Comment: finalizedState.comment,
    },
  ])
}

const parseWait = (ctx: ICtx) => (stateDefn: IWait | Finalized<IWait>, options: IStepFnOptions) => {
  const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)

  ctx.definitionStates.push([
    `${options.namePrefix || ''}${finalizedState.name ? finalizedState.name : `wait-${ctx.hashState}`}`,
    {
      Type: 'Wait',
      ...toCammelCase<IStepFunctionWait>(stateDefn),
    },
  ])
}

const parsePass = (ctx: ICtx) => (stateDefn: IPass | Finalized<IPass>, options: IStepFnOptions) => {
  const [finalizedState] = isFinalizedState(stateDefn) ? [stateDefn] : finalizeStates([stateDefn], options)

  ctx.definitionStates.push([
    `${options.namePrefix || ''}${finalizedState.name ? finalizedState.name : `pass-${ctx.hashState}`}`,
    {
      Type: 'Pass',
      ...toCammelCase<IStepFunctionPass>(stateDefn),
    },
  ])
}

const parseErrorHandler = (ctx: ICtx) => (
  error: string,
  errorHandler: ErrDefn,
): [IStepFunctionCatcher[], IDictionary<IStepFunctionStep>] => {
  let errorHandlers: IStepFunctionCatcher[] = []
  let errorStates: IDictionary<IStepFunctionStep> = {}

  const finalizedStepFn = parseStepFnSelector(errorHandler.selector)
  const { States } = parseStepFunction(finalizedStepFn.getState(), {
    ...finalizedStepFn.getOptions(),
    defaultErrorHandler: undefined,
  })
  const [[next, _]] = Object.entries(States)

  errorStates = { ...errorStates, ...States }
  errorHandlers.push({
    ErrorEquals: [error],
    Next: next,
  })
  return [errorHandlers, errorStates]
}

const parseParallel = (ctx: ICtx) => (
  parallelDefinition: IParallel | Finalized<IParallel>,
  options: IStepFnOptions,
) => {
  const [finalizedState] = isFinalizedState(parallelDefinition)
    ? [parallelDefinition]
    : finalizeStates([parallelDefinition], options)
  const { catch: stateErrorHandler, branches, name: _, retry, ...rest } = finalizedState
  const stateName = `${options.namePrefix || ''}${finalizedState.name ? finalizedState.name : `map-${ctx.hashState}`}`

  const Branches = branches.map((branch, index) => {
    const branchOpts = branch.deployable.getOptions()
    return parseStepFunction(branch.deployable.getState(), {
      ...options,
      ...{
        ...branchOpts,
        namePrefix: branchOpts.namePrefix ? branchOpts.namePrefix : `Branch${index + 1}-${stateName}-`,
      },
    })
  })

  const errorHandler = stateErrorHandler || options.defaultErrorHandler
  let errorHandlerResult: IStepFunctionCatcher[]

  if (errorHandler !== undefined) {
    const aggregate = Object.keys(errorHandler).map(k => parseErrorHandler(ctx)(k, errorHandler[k]))
    const errorStatesTuple: [string, IStepFunctionStep][] = aggregate.reduce((acc, curr) => {
      const k = Object.keys(curr[1]).map(c => [c, curr[1][c]] as [string, IStepFunctionStep])
      acc = [...acc, ...k]
      return acc
    }, [] as [string, IStepFunctionStep][])
    ctx.errorHandlerStates.push(...errorStatesTuple)
    errorHandlerResult = aggregate.reduce((acc, curr) => {
      acc = [...acc, ...curr[0]]
      console.log(acc)
      return acc
    }, [])
  }

  ctx.definitionStates.push([
    stateName,
    {
      ...toCammelCase<IStepFunctionParallel>(rest),
      Branches,
      Retry: retry
        ? Object.keys(retry).reduce((acc, curr) => {
            acc = [...acc, { ErrorEquals: [curr], ...toCammelCase(retry[curr]) }]
            return acc
          }, [])
        : undefined,
      Catch: errorHandlerResult,
    },
  ])
}

const parseMap = (ctx: ICtx) => (mapDefinition: IMap | Finalized<IMap>, options: IStepFnOptions) => {
  const [finalizedState] = isFinalizedState(mapDefinition) ? [mapDefinition] : finalizeStates([mapDefinition], options)
  const { catch: stateErrorHandler, deployable: stepFn, name: _, retry, ...rest } = finalizedState

  const stateName = `${options.namePrefix || ''}${finalizedState.name ? finalizedState.name : `map-${ctx.hashState}`}`
  const Iterator = parseStepFunction(mapDefinition.deployable.getState(), {
    ...options,
    ...mapDefinition.deployable.getOptions(),
    namePrefix: `MapItem-${stateName}-`,
  })
  const errorHandler = stateErrorHandler || options.defaultErrorHandler
  let errorHandlerResult: IStepFunctionCatcher[]

  if (errorHandler !== undefined) {
    const aggregate = Object.keys(errorHandler).map(k => parseErrorHandler(ctx)(k, errorHandler[k]))
    const errorStatesTuple: [string, IStepFunctionStep][] = aggregate.reduce((acc, curr) => {
      const k = Object.keys(curr[1]).map(c => [c, curr[1][c]] as [string, IStepFunctionStep])
      acc = [...acc, ...k]
      return acc
    }, [] as [string, IStepFunctionStep][])
    ctx.errorHandlerStates.push(...errorStatesTuple)
    errorHandlerResult = aggregate.reduce((acc, curr) => {
      acc = [...acc, ...curr[0]]
      console.log(acc)
      return acc
    }, [])
  }

  ctx.definitionStates.push([
    stateName,
    {
      ...toCammelCase<IStepFunctionMap>(rest),
      Iterator,
      Retry: retry
        ? Object.keys(retry).reduce((acc, curr) => {
            acc = [...acc, { ErrorEquals: [curr], ...toCammelCase(retry[curr]) }]
            return acc
          }, [])
        : undefined,
      Catch: errorHandlerResult,
    },
  ])
}

const parseChoice = (ctx: ICtx) => (choiceDefinition: IChoice, options: IStepFnOptions) => {
  let choiceStates: IDictionary<IStepFunctionStep> = {},
    conditions: IStepFunctionChoiceItem<IDictionary>[] = []

  const choiceStateName = `${
    isFinalizedState(choiceDefinition) ? choiceDefinition.name : `${options.namePrefix || 'choice-'} ${ctx.hashState}`
  }`

  choiceDefinition.choices?.forEach((c, index) => {
    const { finalizedStepFn, ...rest } = c

    const rawStepFn = finalizedStepFn.getState()
    const { States } = parseStepFunction(rawStepFn, {
      namePrefix: `ChoiceItem${index + 1}-${choiceStateName}-`,
      ...options,
    })

    choiceStates = { ...choiceStates, ...States }
    const nextState = Object.keys(States).shift()

    conditions = [
      ...conditions,
      {
        ...toCammelCase<IStepFunctionChoiceItem<IDictionary>>(rest),
        Next: nextState,
      },
    ]
  })

  let defaultChoice: string | undefined
  if (choiceDefinition.default.states) {
    const { States } = parseStepFunction(choiceDefinition.default.states, {
      ...options,
      namePrefix: `Default-${choiceStateName}-`,
    })
    choiceStates = { ...choiceStates, ...States }
    defaultChoice = Object.keys(States).shift()
  }

  ctx.definitionStates.push([
    choiceStateName,
    {
      Type: 'Choice',
      Choices: conditions,
      Default: defaultChoice,
    },
  ])

  for (const [stateName, state] of Object.entries(choiceStates)) {
    ctx.definitionStates.push([stateName, state])
  }
}

const parseGoTo = (ctx: ICtx) => (stateDefn: IGoTo, _: IStepFnOptions) => {
  {
    const lastState = ctx.definitionStates[ctx.definitionStates.length - 1][1]
    if (lastState && !('Next' in lastState && lastState.Next !== '')) {
      ;(ctx.definitionStates[ctx.definitionStates.length - 1][1] as any).Next = stateDefn.next
    }
  }
}

interface ICtx {
  definitionStates: [string, IStepFunctionStep][]
  errorHandlerStates: [string, IStepFunctionStep][]
  validateState<T extends IState>(state: Finalized<T>): boolean
  hashState: string
}

function parseStepFunction(state: Result<IState>[], options: IStepFnOptions) {
  const definitionStates: [string, IStepFunctionStep][] = []
  const errorHandlerStates: [string, IStepFunctionStep][] = []

  let cachedStates: Record<string, true> = {}

  const stepFnHash = hash(JSON.stringify(state))

  const validateState = (currentIndex: number) => <T extends IState>(finalizedState: Finalized<T>): boolean => {
    const stateHash = hash(finalizedState.name)
    const fullStateHash = `${stepFnHash}${stateHash}`

    if (cachedStates !== undefined && cachedStates[fullStateHash] !== undefined) {
      throw new ServerlessError(400, 'Finalized state must only be used once', 'not-allowed')
    } else {
      cachedStates = { ...cachedStates, [fullStateHash]: true }
      return true
    }
  }

  function hashState(index: number) {
    const previousState = index > 1 ? state[index - 1] : false
    const nextState = index > 0 && index + 1 in state ? state[index + 1] : false

    const s = new StringBuilder()
    if (previousState) {
      s.appendString(hash(JSON.stringify(previousState)).toString())
    }
    s.appendString(hash(JSON.stringify(state[index])).toString())
    if (nextState) {
      s.appendString(hash(JSON.stringify(nextState)).toString())
    }
    return s.getOutputString()
  }

  const ctx = { definitionStates, errorHandlerStates }

  state.forEach(
    (stateDefn, index) => {
      const call = (fn: Function) =>
        fn({ ...ctx, hashState: hashState(index), validateState: validateState(index) })(stateDefn, options)

      const parseStateDefn: Record<string, Function> = {
        ['Task']: parseTask,
        ['Succeed']: parseSucceed,
        ['Fail']: parseFail,
        ['Map']: parseMap,
        ['Choice']: parseChoice,
        ['Wait']: parseWait,
        ['Parallel']: parseParallel,
        ['Pass']: parsePass,
        ['GoTo']: parseGoTo,
      }
      call(parseStateDefn[stateDefn.type])
    },
    {
      States: {},
    } as IStepFunction,
  )

  const terminalStates = ['Choice', 'Succeed', 'Fail']

  const stepFunctionDefn = definitionStates.reduce((acc: IDictionary<IStepFunctionStep>, curr, index) => {
    const [stateName, stateDefn] = curr

    acc[stateName] = stateDefn

    const hasNextState = index + 1 in definitionStates
    if (
      !terminalStates.includes(stateDefn.Type) &&
      !('Next' in stateDefn && stateDefn.Next !== '') &&
      hasNextState &&
      !('End' in stateDefn && stateDefn.End)
    ) {
      ;(acc[stateName] as any).Next = definitionStates[index + 1][0]
    }

    return acc
  }, {})

  const errorHandler = ctx.errorHandlerStates.reduce((acc: IDictionary<IStepFunctionStep>, curr, index) => {
    const [stateName, stateDefn] = curr
    acc[stateName] = stateDefn

    const hasNextState = index + 1 in definitionStates
    if (hasNextState) {
      ;(acc[stateName] as any).Next = definitionStates[index + 1][0]
      ;(acc[stateName] as any).End = undefined
    }

    return acc
  }, {})

  return {
    States: { ...stepFunctionDefn, ...errorHandler },
    StartAt: definitionStates[0][0],
  }
}

export const StateMachine: IStateMachineFactory = (stateMachineName, params): IStateMachineApi => {
  const { stepFunction, defaultErrorHandler, ...rest } = params
  const finalizedStepFn = isFinalizedStepFn(stepFunction) ? stepFunction : stepFunction.finalize()
  const hashStepFn = hash(JSON.stringify(finalizedStepFn.getState()))
  cachedStepFn[hashStepFn] = finalizedStepFn

  const definition = parseStepFunction(finalizedStepFn.getState(), {
    defaultErrorHandler,
    ...finalizedStepFn.getOptions(),
  })

  const stateMachine = {
    name: stateMachineName,
    definition,
    ...rest,
  }

  return {
    toYaml() {
      return dump(stateMachine)
    },
    toJSON() {
      return JSON.parse(JSON.stringify(stateMachine))
    },
    visualize() {
      // TODO:
      return {}
    },
  }
}
