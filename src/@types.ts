import {
  IDictionary,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambaContext,
  Omit,
  arn,
  IServerlessFunction,
  IHttpResponseHeaders,
  IHttpRequestHeaders,
} from "common-types";
import { ILoggerApi } from "aws-log";
import { IAdminConfig, IMockConfig, } from "universal-fire"
import { RealTimeAdmin } from "@forest-fire/real-time-admin";
import { setContentType, setFnHeaders } from "./wrapper-fn/headers";

type InvocationResponse = import("aws-sdk").Lambda.InvocationResponse;
export type IWrapperFunction = Omit<IServerlessFunction, "handler">;

import { getSecrets, ErrorMeta, LambdaSequence, UnconstrainedHttpHeaders } from "./private";
/**
 * The API Gateway's _proxy integration request_ structure with the
 * `body` and `headers` removed
 */
export type IApiGateway = Omit<IAWSLambdaProxyIntegrationRequest, "body" | "headers">;

export interface IWrapperOptions {
  /**
   * If you supply an **arn** for this parameter it will turn on
   * the `SequenceTracker` and sequence status will be forwarded to this **arn**
   * at the completion of each step of the `LambdaSequence`.
   *
   * > **Note:** The **arn** provided can be a "partial arn" so long as the appropriate
   * > environment variables are set.
   *
   * > **Note:** This option only needs to be set at the _first_ step in the sequence;
   * > from that point the instruction to use this tracking will be carried forward in
   * > the `o-sequence-tracker` _header_ variable.
   */
  sequenceTracker?: arn;
}

export type IExpectedHeaders = IHttpRequestHeaders & IDictionary;

/**
 * Highlights the most likely props coming in from a request but allows
 * additional properties to be defined too.
 */
export type IWrapperRequestHeaders =
  | IExpectedHeaders
  | IOrchestratedHeaders
  | IAWSLambdaProxyIntegrationRequest["headers"];

export interface IOrchestratedHeaders extends IHttpResponseHeaders, IDictionary {
  ["X-Correlation-Id"]: string;
  /**
   * The transport for firemodel's **service account** when
   * operating within a `LambdaSequence`.
   *
   * > **Note:** the naming convention after the `O-` is meant
   * > to mimic the name of the SSM `module/name`
   */
  ["O-firemodel/SERVICE_ACCOUNT"]?: string;
  /**
   * If you are using firebase and a prior function asked SSM for secrets
   * for the Admin SDK this will likely exist.
   */
  ["O-firemodel/BASE_URL"]?: string;
  /**
   * The status of the _sequence_ when being passed from function
   * to function.
   */
  ["O-Sequence-Status"]?: string;
}

/**
 * the `arn` and `params` to pass in. The _parameters_
 * can be either a static value or a function
 */
export interface IServerlessFunctionSignature {
  arn: string;
  /** either a static param or a dynamic "lookup" property */
  params: IDictionary<any | IOrchestratedDynamicProperty>;
}

export type ISerializedSequence = ISerializedSequenceFalse | ISerializedSequenceTrue;

export interface ISerializedSequenceFalse {
  isSequence: false;
}

export interface ISerializedSequenceTrue {
  isSequence: true;
  totalSteps: number;
  completedSteps: number;
  /**
   * the function in the sequence which is now _executing_; returns
   * not only function name but parameters passed
   */
  activeFn?: arn;
  /** the _functions_ (names only) in the sequence which have **completed** */
  completed: arn[];
  /** the _functions_ (names only) in the sequence which have **remain** to be executed */
  remaining: arn[];
  /**
   * The **steps** defined in the sequence. This is an _ordered_ array of steps, including
   * their ARN, their input _params_,
   */
  steps: ILambdaSequenceStep[];
  /**
   * The **responses** from _all functions_ which have already executed.
   *
   * Data structure is:
   *
   * ```typescript
   * {
   *    functionArn: { ... }
   * }
   * ```
   */
  responses: IDictionary<IDictionary>;
}

/**
 * if the `body` is greater than **4k** then it will be
 * compressed when sent over the wire
 */
export interface ICompressedSection {
  compressed: true;
  data: string;
}

/**
 * **IOrchestratedMessageBody**
 *
 * When making `fn`-to-`fn` invocations the message _body_
 * is boxed into this higher level structure which allows the _body_ to remain
 * untouched but providing transport for HTTP headers and the serialized
 * `LambdaSequence` information.
 *
 * This additional _meta_ infromation is critical to the out-of-the box
 * experience provided by the `wrapper` function as well providing strong typing
 * throughout.
 */
export interface IOrchestratedRequest<T> {
  type: "orchestrated-message-body";
  body: T | ICompressedSection;
  sequence: ISerializedSequence | ICompressedSection;
  headers: IOrchestratedHeaders | ICompressedSection;
}

/**
 * This is a antiquated request form which should not be used anymore
 */
export type IBareRequest<T> = T & {
  _sequence?: ILambdaSequenceStep[];
};

export type IOrchestrationRequestTypes<T> =
  | IOrchestratedRequest<T>
  | IBareRequest<T>
  | IAWSLambdaProxyIntegrationRequest;

/**
 * **ILambdaSequenceStep**
 *
 * A _step_ in a `LambdaSequence`. This includes the function name (`arn`), parameters passed
 * into the step (`params`), workflow status (assigned/active/completed), as well the `results` of
 * execution if the status is in the `completed` status.
 */
export interface ILambdaSequenceStep<T = IDictionary> {
  arn: string;
  /**
   * Dynamic or static value references to fill out the request object
   * for consuming **handler** functions
   */
  params: IOrchestratedProperties<T>;
  type: ILambdaFunctionType;
  status: "assigned" | "active" | "completed" | "skipped";
  /**
   * if error handling is passed in as part of the sequence, the wrapper
   * function will ensure that these error handlers are applied before handing
   * execution control to the consuming **handler** function.
   */
  onError?: OrchestratedErrorHandler | [arn, IDictionary & { error: Error }];
  /**
   * Tasks can be assigned by the conductor to be _conditional_ and therefore
   * when the `LambdaSequence.next()` function is evaluated by the `wrapper`, it will
   * evaluate the next set of functions for conditions and skip over those that don't
   * evaluate to `true`.
   */
  onCondition?: any;
}

export type ILambdaFunctionType = "task" | "fan-out" | "step-start" | "fan-in" | "other";

export interface ILambaSequenceFromResponse<T> {
  request: T;
  apiGateway?: IAWSLambdaProxyIntegrationRequest;
  sequence: LambdaSequence;
  headers: Omit<IOrchestratedHeaders, "X-Correlation-Id"> | IHttpRequestHeaders;
}

/**
 * **ILambdaSequenceNextTuple**
 *
 * Returns both the function name (aka, "arn") of the next
 * function along with any parameters which should be passed
 * to it. Within these parameters it also includes the
 * `_sequence` property to pass along the sequence meta-data
 */
export type ILambdaSequenceNextTuple<T> = [string, IOrchestratedRequest<T>];

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

/**
 * The AWS `context` plus additional properties/functions that the `wrapper`
 * function provides.
 *
 * Optionally you can also pass in a generic to state the type of the the
 * "secrets" returned.
 */
export interface IHandlerContext<T = IDictionary> extends IAWSLambaContext {
  /**
   * The HTTP headers variables passed in via API Gateway or forwarded along
   * by `aws-orchestrate`.
   */
  headers: IWrapperRequestHeaders;
  /**
   * A dictionary of name/value pairs based on the values passed in from the
   * query parameters coming in from API Gateway
   */
  queryParameters: IDictionary;
  /**
   * The custom claims which this function received from API Gateway.
   *
   * **Note:** the claims property is sourced from a deeply nested property in the API Gateway
   * _request body_ -- `apiGateway.requestContext.authorizer.customClaims` -- so
   * this item is just serving as a convenience to the conductor or HTTP event
   * function (who is typically responsible for validating claims). Also note that if this variable is NOT
   * set then this is defaulted to an empty hash/dictionary.
   */
  claims: IDictionary;
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
   * Gives you access to a Firebase `DB` instance via `universal-fire`.
   * This is loaded synchronously so should be included in a serverless functions
   * main dependency bundle (but _tree-shaken_ away if this function is not called).
   */
  database: (config?: IAdminConfig | IMockConfig) => Promise<RealTimeAdmin>;
  /**
   * **getSecrets**
   *
   * gets secrets; leveraging passed in header secrets or going to AWS's
   * **SSM** if needed.
   *
   * ```typescript
   * const secrets = await context.getSecrets('firebase', 'netlify')
   * ```
   */
  getSecrets: typeof getSecrets;
  /**
   * Allows the status code of a _successful_ handler execution to be stated; if
   * left off then it will return `200` (or `204` if no content is returned)
   */
  setSuccessCode: (code: number) => void;
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
   * Allows you to manage how to handle errors which are encountered; both _expected_
   * and _unexpected_ are captured and each can be handled in whichever way you prefer.
   */
  errorMgmt: ErrorMeta;
  /**
   * The **header** for any API Gateway originated function is `appliacation/json` but this
   * can be changed to something else if needed.
   */
  setContentType: typeof setContentType;
  /**
   * Most of the required headers sent back to **API Gateway** or to other **Lambda functions**
   * in a _sequence_ will be provided automatically (e.g., CORS, correlationId, etc.) but if your
   * function needs to send additional headers then you can add them here.
   */
  setHeaders: typeof setFnHeaders;
  /**
   * Invokes another Lambda function.
   *
   * @param fnArn the Function's ARN
   * @param request the request parameters to pass into next fn
   * @param additionalHeaders optionally pass additional header name/values
   *
   * **Note:** this function automatically forwards `X-Correlation-Id`
   * and any secrets that the execution function has gotten
   */
  invoke: <T = IDictionary, H = UnconstrainedHttpHeaders>(
    fnArn: string,
    request: T,
    additionalHeaders?: H
  ) => Promise<InvocationResponse>;
  /**
   * Allows the handler author to _register_ a new `LambdaSequence` for execution.
   *
   * For "conductors" (aka, handler functions which kick-off sequences), this
   * function should always be called and the `wrapper` function will ensure that
   * the `LambdaSequence` is started before the handler function completes.
   */
  registerSequence: (sequence: LambdaSequence) => void;
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
export type IHandlerFunction<E, R> = (event: E, context: IHandlerContext<E>) => Promise<R>;

export interface IErrorWithExtraProperties extends Error {
  [key: string]: any;
}

export type IErrorHandlerFunction = (err: Error) => boolean;
export interface IErrorClass extends Error {
  type?: string;
  code?: string;
  errorCode?: number;
  httpStatus?: number;
}

export interface IDefaultHandlingBase {
  type: "error-forwarding" | "handler-fn" | "default-error" | "default";
  code: number;
  prop: string;
}

export interface IDefaultHandlingForwarding extends IDefaultHandlingBase {
  type: "error-forwarding";
  arn: string;
}

export interface IDefaultHandlingError extends IDefaultHandlingBase {
  type: "default-error";
  error: IErrorClass;
}

export interface IDefaultHandlingCallback extends IDefaultHandlingBase {
  type: "handler-fn";
  defaultHandlerFn: IErrorHandlerFunction;
}

export interface IDefaultHandlingDefault extends IDefaultHandlingBase {
  type: "default";
}

export type IDefaultHandling =
  | IDefaultHandlingForwarding
  | IDefaultHandlingError
  | IDefaultHandlingCallback
  | IDefaultHandlingDefault;

/**
 * Allows an Orchestrator to state a property that came from a previously
 * function execution.
 */
export type IOrchestratedDynamicProperty = {
  /** static identifier */
  type: "orchestrated-dynamic-property";
  /**
   * a string that uses _dot notation_ to indicate both the function (aka, `arn`)
   * and _property_ from the given function which you want to poss in.
   *
   * For instance, `myFunction.data` would reference the `myFunction` responses and pull
   * off the value of the `data` from the responses.
   */
  lookup: string;
};

/**
 * Properties defined must be _static_ at the time of the
 * Orchestrator's run-time (e.g., `T[P]`) or they can alternatively
 * defer to a function which will be passed a hash of all functions
 * which have been executed so far in the sequence
 * ( `IOrchestratedDynamicProperty` ).
 *
 * An example of the _dynamic_ association in an Orchestrator might
 * look something like:
 *
 * ```typescript
 * LambdaSequence
 *  .add('firstThis')
 *  .add<IRequestThenThis>('thenThis', { foo: 456 })
 *  .add('andNow', {
 *     title: 'something static',
 *     data: dynamic('firstThis', 'data'),
 *     supplemental: dynamic('thenThis', 'data')
 *   })
 * ```
 */
export type IOrchestratedProperties<T> = {
  [P in keyof T]: T[P] | IOrchestratedDynamicProperty;
};

export type IFanOutTuple<T = IDictionary> = [string, T];
export interface IFanOutResponse<T> {
  failures?: T[];
}

export type OrchestratedErrorHandler = <T extends Error = Error>(error: T) => Promise<boolean>;
/**
 * An ARN and function parameters to specify where errors should be forwarded to
 */
export type OrchestratedErrorForwarder<T extends IDictionary = IDictionary> = [arn, T];
export type OrchestratedCondition = <T>(params: T, seq: LambdaSequence) => Promise<boolean>;
