import { IDictionary } from 'common-types'
import { AwsResource, buildStepFunctionRequest, parseArn } from '../private'
import { logger } from 'aws-log'

export async function invokeStepFn(stepArn: string, request: IDictionary, options: IDictionary = {}) {
  const stepFn = new (await import('aws-sdk')).StepFunctions({ params: { foo: 'bar' } })
  return new Promise((resolve, reject) => {
    stepFn.startExecution(
      buildStepFunctionRequest(parseArn(stepArn, AwsResource.StepFunction), request),
      (err, data) => {
        if (err) {
          const log = logger()
            .reloadContext()
            .addToLocalContext({ workflow: 'aws-log/stepFunction' })
          const e = new Error(err.message)
          e.stack = err.stack
          e.name = 'InvocationError'
          log.error(`Problem starting the step function '${stepArn}'`, e)
          throw e
        }
        resolve(data)
      },
    )
  })
}
