import { IStateMachine } from 'common-types'
import { StateMachine, StepFunction } from '../src/wrapper-step-fn'

describe('Step Function Wrapper', () => {
  it('should return state machine', () => {
    const stateMachineName = 'fooStateMachine'
    const stepFn = StepFunction()
      .task('asdasda')
      .map('foo')
      .use(sf => {
        return sf.task('subTask2').success()
      })
      .success()

    const stateMachineApi = StateMachine(stateMachineName, stepFn)
    const stateMachineDefinition = stateMachineApi.generate()
    const stateMachineYaml = stateMachineApi.toYaml()

    expect(stateMachineDefinition).not.toBeUndefined()
    expect(stateMachineYaml).toEqual('foo')

    expect(stepFn).toBeObject()
  })
})
