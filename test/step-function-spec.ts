import {
  DefaultErrorHandler,
  State,
  StateMachine,
  StepFunction,
} from '../src/wrapper-step-fn'

describe('Step Function', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234'
    process.env.APP_NAME = 'abcapp'
  })

  it('Defining step function should be able to be configured by fluent API', () => {
    const unfinalizedStepFn = StepFunction().task('task1')

    const finalizedStepFn = StepFunction()
      .task('task1926')
      .succeed()

    const defaultErrorHandler: DefaultErrorHandler = {
      Timeout: unfinalizedStepFn,
      customError: finalizedStepFn,
      TypeError: s => s.task('task3'),
    }

    const task1 = State(s => s.task('helloWorld', { name: 'foo2042' }))
    const stepFn = StepFunction(task1)
    const stateMachine = StateMachine('myAwesomeStateMachine', { stepFunction: stepFn, defaultErrorHandler })

    const f = stateMachine.toJSON()
    console.log(JSON.stringify(f.definition.StartAt))

    expect(f.definition.States).toBeUndefined()
  })

  it.todo("Defining step function should be able to be configured passing states and step fn options as arguments")

  it.todo("Defining step function with states as arguments should be extendable with fluentAPI")

  it("`succeed`, `fail`, `choice` should return `IFinalizedStepFn`", () => {

    const succeed = State(s => s.succeed())

    const task = State(s => s.task("foo", {name: "asdas"}))
    const stepFn = StepFunction(task)

    expect(stepFn.succeed()).toHaveProperty("getState")
    expect(stepFn.succeed()).toHaveProperty("getOptions")

    expect(stepFn.fail("random Error")).toHaveProperty("getState")
    expect(stepFn.fail("random Error")).toHaveProperty("getOptions")

    expect(stepFn.choice([])).toHaveProperty("getState")
    expect(stepFn.choice([])).toHaveProperty("getOptions")
  })

  it.todo("Defining last state as terminal state should finalize the step function")

  it.todo("Defining finalized state within the step function states should finalize the step function")
})
    

