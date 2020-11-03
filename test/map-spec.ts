import { assert } from 'chai'
import { IMapOptions, ParamsKind, State, StepFunction } from '../src/wrapper-step-fn'

describe('Map State', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'fooregion'
    process.env.AWS_STAGE = 'dev'
    process.env.AWS_ACCOUNT = '1234'
    process.env.APP_NAME = 'abcapp'
  })

  it('Defining map with name using fluent API should return `Finalized<IMap>`', () => {
    const mapOptions: IMapOptions = { name: 'notifyAllUsers', maxConcurrency: 2 }
    const notifyAllUsers = State(s =>
      s.map('$.users', mapOptions).use(s => s.task('emailNotification').task('persistNotificationResults')),
    )

    expect(notifyAllUsers.deployable.getState()).toHaveLength(2)
    expect(notifyAllUsers).toContainEntries(Object.entries(mapOptions))
  })

  it('Defining map without name should be able to be configured by an array of states and step fn options and return `IMap`', () => {
    const emailNotification = State(s => s.task('emailNotification'))
    const persistNotificationResults = State(s => s.task('persistNotificationResults'))

    const notifyAllUsers = State(s =>
      s.map('$.users', { name: 'notifyAllUsers' }).use([emailNotification, persistNotificationResults]),
    )

    console.log(notifyAllUsers)

    expect(notifyAllUsers.deployable.getState()).toHaveLength(2)
  })

  // move to step fn
  // use shorthand term
  // path validation
  // use specific error `Brilliant Errors`
  it('Defining map within a step function should return only the map state with its states in own state object', () => {
    const getUserInfo = State(s => s.task('getUserInfo'))

    const emailNotification = State(s => s.task('emailNotification'))
    const persistNotificationResults = State(s => s.task('persistNotificationResults'))

    const stepFnOptions = { namePrefix: 'map-' }
    const notifyAllUsers = StepFunction(getUserInfo)
      .map('$.users', { name: 'notifyAllUsers' })
      .use([emailNotification, persistNotificationResults, stepFnOptions])
      .succeed()

    console.log(notifyAllUsers.getState())

    expect(notifyAllUsers.getState()).toHaveLength(3)
  })
})
