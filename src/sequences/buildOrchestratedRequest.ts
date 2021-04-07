import { IDictionary } from "common-types";
import { IOrchestratedRequest, ISerializedSequence, IOrchestratedHeaders } from "~/types";
import { getRequestHeaders } from "~/wrapper-fn/headers";
import { LambdaSequence } from "../LambdaSequence";
import { compress } from "./compress";

export function buildOrchestratedRequest<T>(
  body: T,
  sequence?: LambdaSequence,
  /**
   * By default this function will include all _request headers_
   * such as the forwarding of _secrets_ but if you want to include
   * additional ones they can be added with this parameter.
   */
  additionalHeaders?: IDictionary
): IOrchestratedRequest<T> {
  if (!sequence) {
    sequence = LambdaSequence.notASequence();
  }

  const headers = additionalHeaders ? { ...getRequestHeaders(), ...additionalHeaders } : getRequestHeaders();

  return {
    type: "orchestrated-message-body",
    body: compress<T>(body, 4096),
    sequence: compress<ISerializedSequence>(sequence.toObject(), 4096),
    headers: compress<IOrchestratedHeaders>(headers, 4096),
  };
}
