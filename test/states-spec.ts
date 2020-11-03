import { assert } from 'chai'
import { Finalized, ITask, State } from '../src/wrapper-step-fn'

const setEnvironmentVariables = () => {
  process.env.AWS_REGION = 'fooRegion'
  process.env.AWS_STAGE = 'dev'
  process.env.AWS_ACCOUNT = '1234'
  process.env.APP_NAME = 'AbcApp'
}

describe('Task State', () => {
  it('Defining task with options but without name should return `ITask` state', () => {
    const inputPath = '$.notificationPayload'
    const fullArn = 'arn:aws:lambda:fooregion:1234:function:abcapp-dev-fooSendEmail'
    const sendEmail = State(s => s.task(fullArn, { inputPath }))

    expect(sendEmail.type).toEqual('Task')
    expect(sendEmail).toHaveProperty('name', undefined)
    expect(sendEmail.isTerminalState).toEqual(false)
    expect(sendEmail.resource).toEqual(fullArn)
    expect(sendEmail.inputPath).toEqual(inputPath)
  })

  it('Defining task with options and name should return `Finalized<ITask>` state', () => {
    const taskName = 'NotifyAllCustomers'
    const fullArn = 'arn:aws:lambda:fooregion:1234:function:abcapp-dev-fooSendEmail'
    const inputPath = '$.notificationPayload'
    const sendEmail: Finalized<ITask> = State(s => s.task(fullArn, { name: taskName, inputPath }))

    expect(sendEmail.type).toEqual('Task')
    expect(sendEmail.name).toEqual(taskName)
    expect(sendEmail.resource).toEqual(fullArn)
    expect(sendEmail.isTerminalState).toEqual(false)
    expect(sendEmail.inputPath).toEqual(inputPath)
  })

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

describe('Wait State', () => {
  it('Defining wait without name should return `IWait` with its options', () => {
    const waitOptions = { timestamp: '2016-08-18T17:33:00Z' }

    const waitState = State(s => s.wait(waitOptions))

    expect(waitState.type).toEqual('Wait')
    expect(waitState).toHaveProperty('name', undefined)
    expect(waitState.isTerminalState).toEqual(false)
    expect(waitState).toContainEntries(Object.entries(waitOptions))
  })

  it('Defining wait with name should return `Finalized<IWait>` with its options', () => {
    const stateName = 'asdasa'
    const waitOptions = { timestamp: '2016-08-18T17:33:00Z', name: stateName }

    const waitState = State(s => s.wait(waitOptions))

    expect(waitState.type).toEqual('Wait')
    expect(waitState.name).toEqual(stateName)
    expect(waitState.isTerminalState).toEqual(false)
    expect(waitState).toContainEntries(Object.entries(waitOptions))
  })
})

describe('Pass State', () => {
  it('Defining pass without name should return `IPass` with its options', () => {
    const passOptions = { comment: 'fooComment' }

    const passState = State(s => s.pass(passOptions))

    expect(passState.type).toEqual('Pass')
    expect(passState).toHaveProperty('name', undefined)
    expect(passState).toContainEntries(Object.entries(passOptions))
    expect(passState.isTerminalState).toBeFalse()
  })

  it('Defining pass with name should return `Finalized<IPass>` with its options', () => {
    const taskName = 'fooPass'

    const passOptions = { comment: 'fooComment', name: taskName }

    const passState = State(s => s.pass(passOptions))

    expect(passState.type).toEqual('Pass')
    expect(passState.name).toEqual(taskName)
    expect(passState).toContainEntries(Object.entries(passOptions))
    expect(passState.isTerminalState).toBeFalse()
  })
})

describe('Fail State', () => {
  it('Defining fail without name should return `IFail` with its options', () => {
    setEnvironmentVariables()
    const failedCause = 'unknown reason'
    const failOptions = { error: 'NotAuthorized', comment: 'not authorized' }

    const failState = State(s => s.fail(failedCause, failOptions))

    expect(failState.type).toEqual('Fail')
    expect(failState).toHaveProperty('name', undefined)
    expect(failState.isTerminalState).toBeTrue()
    expect(failState).toContainEntries(Object.entries(failOptions))
  })

  it('Defining fail with name should return `Finalized<IFail>` with its options', () => {
    setEnvironmentVariables()
    const failedCause = 'unknown reason'
    const taskName = 'fooFailState'
    const failOptions = { error: 'NotAuthorized', comment: 'not authorized', name: taskName }

    const failState = State(s => s.fail(failedCause, failOptions))

    expect(failState.type).toEqual('Fail')
    expect(failState.name).toEqual(taskName)
    expect(failState.isTerminalState).toBeTrue()
    expect(failState).toContainEntries(Object.entries(failOptions))
  })
})

describe('Succeed State', () => {
  it('Defining succeed without name should return `ISucceed` with its options', () => {
    const succeedState = State(s => s.succeed())

    expect(succeedState.type).toEqual('Succeed')
    expect(succeedState.isTerminalState).toBeTrue()
    expect(succeedState).toHaveProperty('name', undefined)
  })

  it('Defining succeed with name should return `Finalized<ISucceed>` with its options', () => {
    const taskName = 'fooSucceedState'

    const succeedState = State(s => s.succeed(taskName))

    expect(succeedState.type).toEqual('Succeed')
    expect(succeedState.isTerminalState).toBeTrue()
    expect(succeedState.name).toEqual(taskName)
  })
})
