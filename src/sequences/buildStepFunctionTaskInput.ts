import { IDictionary } from 'common-types';
import { LambdaSequence } from '../LambdaSequence';
import { getRequestHeaders } from '../wrapper-fn';
import { IOrchestratedRequest, ISerializedSequence, IOrchestratedHeaders } from '../@types';
import { IStepFunctionTaskPayload, IStepFunctionTaskResponse } from '../private';
import { compress } from './compress';

export function buildStepFunctionTaskInput<T>(
  body: T,
  /**
   * By default this function will include all _request headers_
   * such as the forwarding of _secrets_ but if you want to include
   * additional ones they can be added with this parameter.
   */
  additionalHeaders?: IDictionary,
): IStepFunctionTaskPayload<T> {
  const headers = additionalHeaders ? { ...getRequestHeaders(), ...additionalHeaders } : getRequestHeaders();

  return {
    type: 'step-fn-message-body',
    body,
    headers: compress<IOrchestratedHeaders>(headers, 4096),
  };
}
