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

// describe('State name unique names', () => {
//   beforeEach(() => {
//     process.env.AWS_REGION = 'fooregion'
//     process.env.AWS_STAGE = 'dev'
//     process.env.AWS_ACCOUNT = '1234'
//     process.env.APP_NAME = 'abcapp'
//   })
//   it('All state names specified should be translated to Step Function definition state object key', () => {
//     const cliExecution = State(s => s.task('cliExecution', { name: 'cliExecution' }))
//     const persistRecordState = State(s => s.task('persistRecordState', { name: 'persistRecordState' }))
//     const cliExecutionAllItems = State(s =>
//       s.map('$.items', { name: 'cliExecutionAllItems' }).use([cliExecution, persistRecordState]),
//     )
//     const notifyAllResults = State(s => s.task('notifyAllResults', { name: 'notifyAllResults' }))

//     const stateMachineDefinition = StepFunction(cliExecutionAllItems, notifyAllResults)
//     const myStateMachine = StateMachine('myStateMachine', { stepFunction: stateMachineDefinition }).toJSON()

//     expect(Object.keys(myStateMachine.definition.States)).toIncludeAllMembers([
//       cliExecutionAllItems.name,
//       notifyAllResults.name,
//     ])
//     expect(
//       Object.keys((myStateMachine.definition.States[cliExecutionAllItems.name] as IStepFunctionMap).Iterator.States),
//     ).toIncludeAllMembers([
//       `MapItem-${cliExecutionAllItems.name}-${cliExecution.name}`,
//       `MapItem-${cliExecutionAllItems.name}-${persistRecordState.name}`,
//     ])
//   })

//   it('All task states should return finalized state with the name gathered from resource name', () => {
//     const resourceName = 'awesomeResourceName'
//     const taskState = State(s => s.task(resourceName))
//     const myStateMachine = StateMachine('myStateMachine', { stepFunction: StepFunction(taskState) }).toJSON()
//     expect(Object.keys(myStateMachine.definition.States)).toIncludeAllMembers([resourceName])
//   })

//   it('All states within choice condition should have a preffix', () => {
//     const resourceName = 'downloadJob'
//     const downloadJob = State(s => s.task(resourceName))

//     const conditionA = condition(s => s.stringEquals('a'), [downloadJob])
//     const conditionB = condition(s => s.stringEquals('b'), [downloadJob])
//     const defaultChoice = condition(s => s.default(), [downloadJob])

//     const choiceState = State(s => s.choice([conditionA, conditionB, defaultChoice], { name: 'myChoiceState' }))

//     const myStateMachine = StateMachine('myStateMachine', { stepFunction: StepFunction(choiceState) }).toJSON()

//     expect(Object.keys(myStateMachine.definition.States)).toIncludeAllMembers([
//       'myChoiceState',
//       `ChoiceItem1-myChoiceState-${resourceName}`,
//       `ChoiceItem2-myChoiceState-${resourceName}`,
//       `Default-myChoiceState-${resourceName}`,
//     ])
//   })

//   it('All states within map iterator should have preffix', () => {
//     const resourceName = 'cliExecution'
//     const allCliExecution = State(s => s.map('$.items', { name: 'allCliExecution' }).use(s => s.task(resourceName)))

//     const myStateMachine = StateMachine('myStateMachine', { stepFunction: StepFunction(allCliExecution) }).toJSON()

//     expect(Object.keys(myStateMachine.definition.States)).toIncludeAllMembers(['allCliExecution'])
//     expect(
//       Object.keys((myStateMachine.definition.States['allCliExecution'] as IStepFunctionMap).Iterator.States),
//     ).toIncludeAllMembers([`MapItem-allCliExecution-${resourceName}`])
//   })

//   it('All states within each parallel branch should have preffix', () => {
//     const validateData = State(s => s.task('validateData'))
//     const saveIntoCache = State(s => s.task('saveIntoCache'))

//     const parallelWork = State(s =>
//       s.parallel([StepFunction(validateData), StepFunction(saveIntoCache)], { name: 'parallelWork' }),
//     )

//     const myStateMachine = StateMachine('myStateMachine', { stepFunction: StepFunction(parallelWork) }).toJSON()
//     expect(Object.keys(myStateMachine.definition.States)).toIncludeAllMembers(['parallelWork'])
//     expect(
//       Object.keys(
//         (myStateMachine.definition.States['parallelWork'] as IStepFunctionParallel).Branches.reduce((acc, curr) => {
//           acc = { ...acc, ...curr.States }
//           return acc
//         }, {}),
//       ),
//     ).toIncludeAllMembers(['Branch1-parallelWork-validateData', 'Branch2-parallelWork-saveIntoCache'])
//   })

//   it('All other states without specific name should not be finalized and name should be the type preffix with state hash', () => {
//     const debugStep = State(s => s.pass())
//     const succeedStep = State(s => s.succeed())
//     const choice = State(s =>
//       s.choice([condition(c => c.stringEquals('debug'), [debugStep]), condition(c => c.default(), [succeedStep])]),
//     )

//     const myStateMachine = StateMachine('myStateMachine', { stepFunction: StepFunction(choice) }).toJSON()
//     const choiceStateName = Object.keys(myStateMachine.definition.States).find(s => s.startsWith('Choice-'))
    
//     expect(Object.keys(myStateMachine.definition.States).some(s => s.startsWith('Choice-'))).toBeTrue()
//     expect(Object.keys(myStateMachine.definition.States).some(s => s.startsWith(`ChoiceItem1-${choiceStateName}`))).toBeTrue()
//     expect(Object.keys(myStateMachine.definition.States).some(s => s.startsWith(`Default-${choiceStateName}`))).toBeTrue()
//   })
// })
