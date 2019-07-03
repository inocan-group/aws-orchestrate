import { IDictionary, IAWSLambdaProxyIntegrationRequest } from "common-types";
import { LambdaSequence } from "./LambdaSequence";

/**
 * **ILambdSequenceStep**
 *
 * A _step_ in a `LambdaSequence`. This includes the function name (`arn`), parameters passed
 * into the step (`params`), workflow status (assigned/active/completed), as well the `results` of
 * execution if the status is in the `completed` status.
 */
export interface ILambdaSequenceStep<T = IDictionary> {
  arn: string;
  params: Partial<T>;
  type: ILambdaFunctionType;
  status: "assigned" | "active" | "completed";
  results?: T;
}

export type ILambdaFunctionType =
  | "task"
  | "fan-out"
  | "step-start"
  | "fan-in"
  | "other";

export type Sequence<T> = T & { _sequence: ILambdaSequenceStep[] };

export interface ILambaSequenceFromResponse<T> {
  request: T;
  apiGateway?: IAWSLambdaProxyIntegrationRequest;
  sequence: LambdaSequence;
}

/**
 * **ILambdaSequenceNextTuple**
 *
 * Returns both the function name (aka, "arn") of the next
 * function along with any parameters which should be passed
 * to it. Within these parameters it also includes the
 * `_sequence` property to pass along the sequence meta-data
 */
export type ILambdaSequenceNextTuple<T> = [string, Sequence<T>];
