
describe('State Machine', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234'
    process.env.APP_NAME = 'abcapp'
  })

  it.todo("Defining error handler as state machine options should be populated in all children states")

  it.todo("Defining error handler as step function options should be populated in all children states")

  it.todo("Defining state `catch` error handler should overwrite error handlers defined in step function and state machineWrapper")

  it.todo("Next sequence should be the same as array items index")

  it.todo("The first state should be marked as `StartAt`")

  it.todo("`toYaml` should return yaml definition as string value")

  it.todo("finalized states must only be used once")

  it.todo("finalized step functions must only be used once")

})

// Find Last Element
// Find array element type