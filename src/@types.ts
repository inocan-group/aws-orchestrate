import {
  IDictionary,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambaContext,
  IAwsLambdaEvent
} from "common-types";
import { LambdaSequence } from "./LambdaSequence";
import { ILoggerApi } from "aws-log";
import { ErrorMeta } from "./ErrorMeta";
import { getSecrets as secrets, IGetSecrets } from "./wrapper/getSecrets";
import { IFirebaseAdminConfig } from "abstracted-firebase";
import { DB } from "abstracted-admin";

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

/**
 * Configure how an error should be identified; typically you would only
 * use one condition but if multiple are used they are considered an `AND`
 * logical condition
 */
export interface IErrorIdentification {
  errorClass?: new (...args: any) => Error;
  code?: string;
  name?: string;
  messageContains?: string;
}

export type arn = string;
export interface IErrorHandling {
  /** forward to another lambda function */
  forwardTo?: arn;
  /**
   * send it to a callback function; if the callback
   * returns `true` then no error will be thrown with
   * the understanding that the error has been handled
   * in some way.
   */
  callback?: (e: Error) => boolean;
}

export interface IErrorHandlingDefault {
  defaultHandling: true;
}

// export type IErrorHandling = IErrorHandlingDefault | IErrorHandlingNonDefault;

/**
 * the API provided via `context` for handlers who are wrapped by
 */
export interface IHandlerContext<T> extends IAWSLambaContext {
  /**
   * The sequence which this execution is part of
   */
  sequence: LambdaSequence;
  /**
   * Check whether the given function execution is part of a
   * sequence
   */
  isSequence: boolean;
  /**
   * Indicates whether the current sequence is "done" (aka, the current
   * function execution is the _last_ function in the sequence)
   *
   * Note: if the function is NOT running as part of a sequence this will
   * always be `false`
   */
  isDone: boolean;
  /**
   * your pre-configured logging interface
   */
  log: ILoggerApi;
  /**
   * Provides a handy utility function of providing you access to a Firebase
   * database connection. This is loaded asynchronously so there is no code
   * penality for Firebase if you aren't using it.
   */
  database: (config?: IFirebaseAdminConfig) => Promise<DB>;
  /**
   * a utility function to help facilitate getting secrets
   * either from SSM or locally if available
   */
  getSecrets: IGetSecrets<T>;
  /**
   * The API Gateway "proxy integration" request data; this is left blank if the call was not
   * made from API Gateway (or the function is not using proxy integration)
   */
  apiGateway: IAWSLambdaProxyIntegrationRequest;
  /**
   * A boolean flag which indicates whether the current execution was started by an API Gateway
   * event.
   */
  isApiGatewayRequest: boolean;
  /**
   * Allows you to describe all the errors you expect as well as how to handle them as well
   * _unhandled_ or _unexpected_ errors.
   */
  errorMeta: ErrorMeta;
}

/**
 * **IOrchestrationHandlerFunction**
 *
 * A type definition for an AWS Lambda "Handler Function" which is being wrapped
 * by the `handler` function from `aws-orchestrate`. Because this wrapping allows
 * us to be "better citizens" from a Typescript standpoint this type definition
 * requires that you state explicitly the **Request**<`E`> and **Response**<`R`> types
 * as generics passed in.
 */
export type IHandlerFunction<E, R> = (
  event: E,
  context: IHandlerContext<E>
) => Promise<R>;

export interface IErrorWithExtraProperties extends Error {
  [key: string]: any;
}
