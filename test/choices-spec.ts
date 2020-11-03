import { Condition, IStepFnOptions, ParamsKind, State, StateMachine, StepFunction } from '../src/wrapper-step-fn'

describe('Choices State', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234'
    process.env.APP_NAME = 'abcapp'
  })

  it('Defining default choice condition should be able to be configured by fluent API', () => {
    const fetchGravatar = Condition(
      c => c.default(),
      s => s.task('fetchAvatarUrlFromGravatar')
    )

    const fetchProfileImgUrl = State(s => s.choice([fetchGravatar]))

    expect(fetchProfileImgUrl.default).not.toBeUndefined()
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue()
    expect(fetchProfileImgUrl.choices).toHaveLength(0)
  })

  it('Defining choices should be able to be configured by fluent API', () => {
    const fetchProfileImgUrl = State(s =>
      s.choice([
        { variable: '$.type', stringEquals: 'gravatar', stepFn: s => s.task('fetchFromGravatar') },
        { variable: '$.type', stringEquals: 'unavatar', stepFn: s => s.task('fetchFromUnavatar') },
      ]),
    )

    expect(fetchProfileImgUrl.default).toBeUndefined()
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue()
    expect(fetchProfileImgUrl.choices).toHaveLength(2)
  })

  // use shorthand term
  // move to step fn
  // validate terminal state about
  it('Defining choice conditions should be able to be configured by an array of states and step fn options', () => {
    const fetchFromGravatar = State(s => s.task('fetchAvatarUrlFromGravatar'))
    const saveIntoDb = State(s => s.task('SaveIntoDb'))
    const defaultOpts: IStepFnOptions = { namePrefix: 'default-' }
    const defaultChoice = Condition(c => c.default(), [fetchFromGravatar, saveIntoDb, defaultOpts], '$.type')

    const fetchFromUnavatar = State(s => s.task('fetchFromUnavatar'))
    const unavatarOpts: IStepFnOptions = { namePrefix: 'unavatar-' }
    const unavatarChoice = Condition(c => c.stringEquals('unavatar'), [fetchFromUnavatar, unavatarOpts], '$.type')

    const fetchProfileImgUrl = State(s => s.choice([defaultChoice, unavatarChoice]))

    const stepFn = StepFunction(fetchProfileImgUrl)

    const stateMachine = StateMachine("foo", { stepFunction: stepFn}).toJSON()

    const stateNames = Object.keys(stateMachine.definition.States)

    console.log(stateMachine)
    console.log(stateNames)
    expect(stateNames).toSatisfy((s: string) => s.startsWith("default-"))
    expect(fetchProfileImgUrl.default).not.toBeUndefined()
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue()
    expect(fetchProfileImgUrl.choices).toHaveLength(1)
  })

  it('Defining choice ')

  it('Defining a choice state within a step function should return all the states definition of all choice conditions', () => {
    const saveBasicInfo = State(s => s.task('saveBasicInfo'))

    const fetchFromGravatar = State(s => s.task('fetchAvatarUrlFromGravatar'))
    const saveIntoDb = State(s => s.task('SaveIntoDb'))
    const defaultChoice = Condition(c => c.default(), [fetchFromGravatar, saveIntoDb])

    const fetchFromUnavatar = State(s => s.task('fetchFromUnavatar'))
    const unavatarChoice = Condition(c => c.stringEquals('unavatar'), [fetchFromUnavatar], '$.type')

    const myAwesomeStepFunction = StepFunction(saveBasicInfo).choice([defaultChoice, unavatarChoice])

    expect(myAwesomeStepFunction.getState()).toHaveLength(2)
  })
})
