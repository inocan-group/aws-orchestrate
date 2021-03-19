import { logger } from 'aws-log'
import { maskLoggingForSecrets } from '../src/wrapper-fn'

describe('Secrets => ', () => {
  it('Secrets must be masked with asterisk', () => {
    const secretsModules = {
      aws: {
        foo: '+1123123123',
        bar: 'aws.bar',
      },
      firebase: {
        foo: 'firebase.foo',
      },
    }
    const l = logger()
    maskLoggingForSecrets(secretsModules, l)

    const logResult = l.info('+1123123123')
    expect(logResult.message).toEqual('************')
  })
})
