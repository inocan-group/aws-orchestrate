import { LambdaSequence } from '../LambdaSequence'
import { IDictionary } from 'common-types'
import { getRequestHeaders } from '../wrapper-fn'
import { compress } from './compress'
import { IOrchestratedRequest, ISerializedSequence, IOrchestratedHeaders } from '../@types'
import { IStepFunctionTaskPayload, IStepFunctionTaskResponse } from '../private'

export function buildStepFunctionTaskInput<T>(
  body: T,
  /**
   * By default this function will include all _request headers_
   * such as the forwarding of _secrets_ but if you want to include
   * additional ones they can be added with this parameter.
   */
  additionalHeaders?: IDictionary,
): IStepFunctionTaskPayload<T> {
  const headers = additionalHeaders ? { ...getRequestHeaders(), ...additionalHeaders } : getRequestHeaders()

  return {
    type: 'step-fn-message-body',
    body: body,
    headers: compress<IOrchestratedHeaders>(headers, 4096),
  }
}