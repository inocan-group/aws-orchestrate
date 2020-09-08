import * as helpers from './testing/helpers'

import { IAWSLambaContext, IAWSLambdaProxyIntegrationRequest } from 'common-types'
import { IHandlerContext, IHandlerFunction, ServerlessError, wrapper } from '../src/index'

const CORRELATION_ID = 'c-123'
const AWS_REQUEST_ID = '1234'
const FUNCTION_NAME = 'myHandlerFunction'
const ERROR_CODE = 403

describe('Handling errors => ', () => {
  it('throwing a ServerlessError is passed through by the wrapper function', async () => {
    let foo: number = 0
    const myHandler: IHandlerFunction<void, void> = async (req, ctx) => {
      foo = 1
      throw new ServerlessError(ERROR_CODE, 'a test of an explicit error throw', 'testing')
    }
    try {
      const restore = helpers.captureStdout()
      const wrapped = wrapper(myHandler)
      restore()
      const result = await wrapped(
        { headers: { 'X-Correlation-Id': CORRELATION_ID } } as IAWSLambdaProxyIntegrationRequest,
        {
          awsRequestId: AWS_REQUEST_ID,
          functionName: FUNCTION_NAME,
        } as IAWSLambaContext,
      )
    } catch (e) {
      expect(e.name).toBe('ServerlessError')
      expect(e.httpStatus).toBe(ERROR_CODE)
      expect(e.correlationId).toBe(CORRELATION_ID)
      expect(e.awsRequestId).toBe(AWS_REQUEST_ID)
    }
  })
  it('throwing an error should be catch by default error handler', async () => {
    let foo: number = 0
    const myHandler: IHandlerFunction<void, void> = async (req, ctx) => {
      foo = 1
      throw new ServerlessError(ERROR_CODE, 'a test of an explicit error throw', 'testing')
    }
    try {
    } catch (e) {}
  })
})
