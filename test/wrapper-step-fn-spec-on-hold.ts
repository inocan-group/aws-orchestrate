import { IDictionary } from 'common-types'
import { Condition, IChoice, IConfigurableStepFn, StateMachine, StepFunction, ISucceed, ITask, State, IErrorHandler } from '../src/wrapper-step-fn'

describe('Step Function Wrapper', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooRegion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = 'fooAccount'
     process.env.APP_NAME = 'AbcApp'

  })

  it("should return task state's definition array count", () => {
    // default
    // const defaultErrorHandler: IErrorHandler = { next: };
    const downloadNotification = State(sf => sf.succeed())
    // type IUnamedState = Omit<IState, 'name'> && {name: string | undefined}
    // const downloadNot2 = downloadNotification.copy("d2")
    /**
     * - If name is not specified in state options it should return `IState` ot
     * 
     * - All states allow for explicit naming and doing so changes the type:
     * 
     * State(sf => sf.task('abc')) returns `ITask`
     * State(sf => sf.task('abc', {name: "def"})) returns `Finalized<ITask>`
     * 
     * the `Finalized<T>` states provide a `.copy(name: string)` operation
     */
    
    // const specificError: IErrorHandler = { errorEquals: ["foo"], next: downloadNotification}
    const taskState = State(s => s.task('fooBar'))

    // const uploadNotificationStepFn = StepFunction(taskState, { defaultErrorHandler })
    expect(taskState).toHaveProperty("type", "Task")
  })

  it.todo('should return choice state definition and it choices', () => {
    // task states definition
    const downloadNotification = State(sf => sf.task('downloadNotification'))
    const uploadNotification = State(sf => sf.task('uploadNotification'))

    // choice step state definition
    const uploadNotificationStepFn = StepFunction(uploadNotification, { namePrefix: 'upload-' })
    // const choiceStep = <T = IDictionary>(prop: keyof T, val: any, sf: IConfiguring) =>
    //   Condition(c => c.stringEquals(val), `$.${prop}`, sf)


    // const defaultChoice = Condition(c => c.default(), "1231231", uploadNotification)

    // choice state definition
    // const typeOfNotificationState = State(sf =>
    //   sf.choice([
    //     {
    //       variable: '$.type',
    //       stringEquals: 'download',
    //       stepFn: [downloadNotification, { namePrefix: 'download-' }],
    //     },
    //     {
    //       variable: "$.type",
    //       stringEquals: "foo",
    //       stepFn: sf => sf.task("fooTask").succeed()
    //     },
    //     // choiceStep('type', 'upload', uploadNotificationStepFn),
    //   ], {
      
    //   }),
    // )

    // expect(typeOfNotificationState).toHaveProperty('type', 'Choice')
    // expect((typeOfNotificationState as IChoice).choices).toHaveLength(3)
  })

  it.todo("Default choice picked up and defined correctly")

  it.todo("Choice opption should ")

  it('should return map state state definition', () => {
    const ItmsExecution = State(sf => sf.task('ItmsExecution'))
    const SaveFileStatus = State(sf => sf.task('SaveFileStatus'))

    const ItmsExecutionAll = State(s =>
      s.map('$.files')
        .use([ItmsExecution, SaveFileStatus, { namePrefix: 'map-' }])
    )

    expect(ItmsExecutionAll).toHaveProperty('type', 'Map')
  })

  it('should return state machine', () => {
    const stateMachineName = 'fooStateMachine' 

    const fooState1 = State(s => s.task("fooStateFn1"))
    const fooState2 = State(s => s.task("fooStateFn2"))
    const fooState3 = State(s => s.task("fooStateFn3"))

    const stepFn = StepFunction(fooState1, fooState2,{ namePrefix: "foo-"}, fooState3)

    const stateMachine = StateMachine(stateMachineName, { stepFunction: stepFn})
    const stateMachineDefinition = stateMachine.toJSON()
    const stateMachineYaml = stateMachine.toYaml()

    expect(stateMachineDefinition).not.toBeUndefined()
    console.log(stateMachineDefinition)
    expect(stateMachineYaml).not.toEqual('foo')

    expect(stepFn).toBeObject()
  })

  it.todo("should create step function passing states and a option hash", () => {
    const Succeed: ISucceed = { type: 'Succeed', name: 'Succeed'};
    const FooJob = State(s => s.task("goo", { name: "FooJob" }))

    // const ItmsExecutionAll = State(s =>
    //   s.map('$.files')
    //     .use(s => s.task("sdasd").succeed())
    // )
    
    // const stepFn = StepFunction(ItmsExecutionAll, { namePrefix: "foobar-"})

    // expect(ItmsExecutionAll).toHaveProperty('type', 'Map')
  })
})
