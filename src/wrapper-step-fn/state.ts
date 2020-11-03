import {
  choiceConfiguration,
  failConfiguration,
  isFinalizedStepFn,
  isFluentApi,
  isStateDefn,
  isStepFunction,
  mapConfiguration,
  parallelConfiguration,
  StepFunction,
  succeedConfiguration,
  taskConfiguration,
  waitConfiguration,
} from '.'
import { passConfiguration } from './pass'
import { Finalized, IFinalizedStepFn, IState, IStateConfiguring, IStepFnOptions, IStepFnSelector } from './types'

/**
 * It returns the desired state based on `cb`
 *
 * @param cb fluent api callback
 */
export function State<T extends Finalized<IState> | IState>(cb: (api: IStateConfiguring) => T): T {
  const configuring = {
    succeed: succeedConfiguration,
    task: taskConfiguration,
    map: mapConfiguration,
    fail: failConfiguration,
    choice: choiceConfiguration,
    parallel: parallelConfiguration,
    wait: waitConfiguration,
    pass: passConfiguration,
  } as IStateConfiguring

  return cb(configuring)
}

export function parseAndFinalizeStepFn(selector: IStepFnSelector): IFinalizedStepFn {
  if (isStepFunction(selector)) {
    console.log("isSTepFn")
    console.log(selector)
    if (isFinalizedStepFn(selector))  {
      console.log(selector)
      return selector
    }  else {
     
     const c= selector.finalize()
     console.log(c.getState())
     return c
    }
  } else if (isFluentApi(selector)) {
    const configurationApi = StepFunction()
    const sf = selector(configurationApi)
    return isFinalizedStepFn(sf) ? sf : sf.finalize()
  } else {
    let stepFnOptions: IStepFnOptions = {}

    const states = selector.reduce((acc: IState[], param: IState | IStepFnOptions) => {
      if (isStateDefn(param)) {
        acc.push(param)
      } else {
        stepFnOptions = param
      }
      return acc
    }, [] as IState[])

    return StepFunction(...states, {
      ...stepFnOptions,
    }).finalize()
  }
}
