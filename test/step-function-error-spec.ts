import { IStepFunctionTask } from 'common-types'
import { StepFunction, StateMachine, ITask, errorHandler, State, retryHandler } from '../src/private'

describe('Step Function Builder Error Handler', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234'
    process.env.APP_NAME = 'abcapp'
  })

  it('Definig error step function should start with first state finalized', () => {
    const fooStepFn = StepFunction({
      defaultErrorHandler: errorHandler(e => e.default(s => s.task('foo'))),
    }).task('task1')

    const action = () => StateMachine('foo', { stepFunction: fooStepFn }).toJSON()

    expect(action).toThrowError({ name: 'ServerlessError', message: 'The first state must be finalized' })
  })

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

    expect(
      resultStates
        .filter(r => r.Type === 'Task' && r.Catch !== undefined)
        .every((r: IStepFunctionTask) => {
          const [defaultHandler] = r.Catch
          return defaultHandler.Next !== 'foo1'
        }),
    ).toBeTrue()
  })

  it('Defining state `retry` error handler should be populated to the output state definition', () => {
    const retryOptions = { maxAttempts: 5 }
    const fooTask = State(s => s.task('fooTask', { retry: retryHandler(e => e.default(retryOptions)) }))

    const myStateMachine = StateMachine('fooStateMachine', { stepFunction: StepFunction(fooTask) }).toJSON()

    expect((myStateMachine.definition.States['fooTask'] as IStepFunctionTask).Retry[0].MaxAttempts).toBe(
      retryOptions.maxAttempts,
    )
  })
})

// TODO: implement this syntax instead of the existing one
// catch: e => e.permissions(fn1, fn2).custom(cond, fn5).allOthers(fn3,fn4)

// export interface IErrHandlerBuilder<T> {
//   all: (...rest: any[]) => IErrHandlerBuilder<T | 'all'>;
//   custom: (cond: string, ...rest: any[]) => IErrHandlerBuilder;
//   allOthers: (...rest: any[]) => IErrHandlerBuilder; 
// }

// const foo: Exclude<IErrHandlerBuilder, 'allOthers'>;