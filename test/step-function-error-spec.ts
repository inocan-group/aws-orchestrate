import { IStepFunctionTask } from 'common-types'
import { StepFunction, StateMachine, ITask, errorHandler } from '../src/private'

describe('Step Function Builder Error Handler', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234'
    process.env.APP_NAME = 'abcapp'
  })

  // it("Defining error handler step function not finalized should throw error", () => {
  //   const unfinalizedStepFn = StepFunction().task('handler1')
  //   const fooStepFn = StepFunction().task("task1")
  //   const defaultErrorHandler: DefaultErrorHandler = {
  //     Timeout: unfinalizedStepFn,
  //   }

  //   const action = () => StateMachine("fooStateMachine", {
  //     stepFunction: fooStepFn,
  //     defaultErrorHandler
  //   })

  //   expect(action).toThrowError({ name: "ServerlessError", message: "Error handler step function must be finalized"})
  // })

  it('Defining error handler as state machine options should be populated in all children states', () => {
    const finalizedStepFn = StepFunction()
      .task('handler2', { name: 'foo1' })
      .task('handler3', { name: 'foo2' })
      .succeed('foo3')
    const fooStepFn = StepFunction().task('task1')

    const stateMachine = StateMachine('fooStateMachine', {
      stepFunction: fooStepFn,
      defaultErrorHandler: errorHandler(e => e.default(finalizedStepFn)),
    }).toJSON()

    const resultStates = Object.values(stateMachine.definition.States)
    console.log(resultStates)

    expect(
      resultStates
        .filter(r => r.Type === 'Task' && r.Catch !== undefined)
        .every((r: IStepFunctionTask) => {
          const [defaultHandler] = r.Catch
          return defaultHandler.Next === 'foo1'
        }),
    ).toBeTrue()
  })

  it('Defining error handler as step function options should be populated in all children states', () => {
    const finalizedStepFn = StepFunction()
      .task('handler2', { name: 'foo1' })
      .task('handler3', { name: 'foo2' })
      .succeed('foo3')

    const fooStepFn = StepFunction({
      defaultErrorHandler: errorHandler(e => e.default(finalizedStepFn)),
    }).task('task1')

    const stateMachine = StateMachine('fooStateMachine', {
      stepFunction: fooStepFn,
    }).toJSON()

    const resultStates = Object.values(stateMachine.definition.States)

    expect(
      resultStates
        .filter(r => r.Type === 'Task' && r.Catch !== undefined)
        .every((r: IStepFunctionTask) => {
          const [defaultHandler] = r.Catch
          console.log(r.Catch)
          return defaultHandler.Next === 'foo1'
        }),
    ).toBeTrue()
  })

  it('Defining state `catch` error handler should overwrite error handlers defined in step function and state machineWrapper', () => {
    const finalizedStepFn = StepFunction()
      .task('handler2', { name: 'foo1' })
      .task('handler3', { name: 'foo2' })
      .succeed('handler4')

    const finalizedStepFn2 = StepFunction()
    .task('handler5', { name: 'handler5' })
    .task('handler6', { name: 'handler6' })
    .finalize()

    const fooStepFn = StepFunction({
      defaultErrorHandler: errorHandler(e => e.default(finalizedStepFn)),
    }).task('task1', {
      catch: errorHandler(e => e.handle(h => h.all, finalizedStepFn2).withoutDefault()),
    })

    const stateMachine = StateMachine('fooStateMachine', {
      stepFunction: fooStepFn,
    }).toJSON()

    const resultStates = Object.values(stateMachine.definition.States)
    console.log(resultStates)

    expect(
      resultStates
        .filter(r => r.Type === 'Task' && r.Catch !== undefined)
        .every((r: IStepFunctionTask) => {
          const [defaultHandler] = r.Catch
          return defaultHandler.Next !== 'foo1'
        }),
    ).toBeTrue()
  })
})
