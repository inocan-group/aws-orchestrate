import { IStepFunctionMap, IStepFunctionParallel } from 'common-types'
import { condition, Finalized, IState, IStateConfiguring, State, StateMachine, StepFunction } from '../src/private'

const setEnvironmentVariables = () => {
  process.env.AWS_REGION = 'fooRegion'
  process.env.AWS_STAGE = 'dev'
  process.env.AWS_ACCOUNT = '1234'
  process.env.APP_NAME = 'AbcApp'
}

describe('States', () => {
  it('Defining states with name should return `Finalized<IState>`', () => {
    setEnvironmentVariables()

    const stateDefinitions: ((api: IStateConfiguring) => IState | Finalized<IState>)[] = [
      s => s.task('foo', { name: 'fooTask' }),
      s => s.wait({ name: 'fooWait' }),
      s => s.pass({ name: 'fooPass' }),
      s => s.succeed('fooSucceed'),
      s => s.fail('unknown reason', { name: 'fooFail' }),
      s =>
        s
          .map('$.foo', { name: 'fooMap' })
          .use([{ type: 'Task', resource: 'fooMapTask', isFinalized: false, isTerminalState: false }]),
      s => s.choice([], { name: 'fooChoice' }),
      s => s.parallel([], { name: 'fooParallel' }),
    ]

    const result = stateDefinitions.map(s => State(s))

    // Flag should be true
    expect(result.every(r => r.isFinalized)).toBeTrue()
    // name property exists in the state object and it's not null
    expect(result.every(r => r.isFinalized && 'name' in r && r.name !== null)).toBeTrue()
  })

  it('Defining states without name should return unfinalized `IState`', () => {
    setEnvironmentVariables()

    const stateDefinitions: ((api: IStateConfiguring) => IState | Finalized<IState>)[] = [
      s => s.task('foo'),
      s => s.wait(),
      s => s.pass(),
      s => s.succeed(),
      s => s.fail('unknown reason'),
      s => s.map('$.foo').use([{ type: 'Task', resource: 'fooMapTask', isFinalized: false, isTerminalState: false }]),
      s => s.choice([]),
      s => s.parallel([]),
    ]

    const result = stateDefinitions.map(s => State(s))

    // Flag should be false
    expect(result.every(r => r.isFinalized)).toBeFalse()
    // name property should not exist in the state object
    expect(result.every(r => !r.isFinalized && !('name' in r))).toBeTrue()
  })
})

describe('Task State', () => {
  it('Defining resource with function name should be translated to proper ARN if ENV variables are configured', () => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234'
    process.env.APP_NAME = 'abcapp'

    const fnName = 'fooSendEmail'
    const sendEmail = State(s => s.task(fnName))

    expect(sendEmail.type).toEqual('Task')
    expect(sendEmail.isTerminalState).toEqual(false)
    expect(sendEmail.resource).toEqual(`arn:aws:lambda:fooregion:1234:function:abcapp-dev-${fnName}`)
  })
})
