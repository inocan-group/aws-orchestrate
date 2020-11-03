import { IParallelOptions, ParamsKind, State, StepFnOptions, StepFunction } from '../src/wrapper-step-fn'

describe('Parallel State', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234 '
    process.env.APP_NAME = 'abcapp'
  })

  it('Defining parallel with name using fluent API should return `Finalized<IParallel>`', () => {
    const notifyTasks = State(s =>
      s.parallel([s => s.task('emailNotification'), s => s.task('smsNotification')]),
    )

    expect(notifyTasks.branches).toHaveLength(2)
  })

  it('Defining parallel without name should be able to be configured by an array of states and step fn options and return `IParallel`', () => {
    const parallelOptions: IParallelOptions = { comment: 'foo' }
    
    const stepFnOptions = StepFnOptions({ namePrefix: 'email-' })
    const customerEmailNotification = State(s => s.task('customerEmailNotification'))
    const employeeEmailNotification = State(s => s.task('customerEmailNotification'))
    const branch1 = [customerEmailNotification, employeeEmailNotification, stepFnOptions]

    const smsNotification = State(s => s.task('smsNotification'))
    const branch2 = [smsNotification]

    const notifyTasks = State(s => s.parallel([branch1, branch2], parallelOptions))
    expect(notifyTasks.branches).toHaveLength(2)
    expect(notifyTasks).toContainEntries(Object.entries(parallelOptions))
  })
  

  // Use assert messages

  it('Defining parallel within a step function should return a state with branches and its own states inside them', () => {
    const parallelOptions: IParallelOptions = { comment: 'foo' }

    const customerEmailNotification = State(s => s.task('customerEmailNotification'))
    const employeeEmailNotification = State(s => s.task('customerEmailNotification'))
    const branch1 = [customerEmailNotification, employeeEmailNotification]

    const smsNotification = State(s => s.task('smsNotification'))
    const branch2 = [smsNotification]

    const myAwesomeStepFunction = StepFunction()
      .parallel([branch1, branch2], parallelOptions)
      .finalize()

    expect(myAwesomeStepFunction.getState()).toHaveLength(1)
  })
})
