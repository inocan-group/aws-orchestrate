import {
  arn,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambdaProxyIntegrationRequestV2,
  IAwsLambdaProxyRequestContextV2,
  IDictionary,
  IHttpRequestHeaders,
  IHttpResponseHeaders,
} from "common-types";
import { LambdaSequence } from "~/sequences";
import { IErrorClass } from "./defaultHandling";
import { AwsResource } from "./general";

export type ILambdaFunctionType = "task" | "fan-out" | "fan-in" | "other";
/**
 * if the `body` is greater than **4k** then it will be
 * compressed when sent over the wire
 */
export interface ICompressedSection {
  compressed: true;
  data: string;
}
export interface ISequenceTrackerStatusBase {
  /**
   * The `correlationId` of the sequence executing
   */
  correlationId: string;
  /**
   * The total number of steps in the sequence
   */
  total: number;
  /**
   * The current step in the sequence
   */
  current: number;
  /**
   * The AWS `arn` of the currently executing function
   */
  currentFn: string;
  /**
   * The AWS `arn` of the function which originated
   * the sequence.
   */
  originFn?: string;
  /**
   * The current status of the sequence
   */
  status: string;
}

export interface ISequenceTrackerStatusSuccess extends ISequenceTrackerStatusBase {
  status: "success";
  data: string;
}
export interface ISequenceTrackerStatusError extends ISequenceTrackerStatusBase {
  status: "error";
  error: IErrorClass;
}
export interface ISequenceTrackerStatusRunning extends ISequenceTrackerStatusBase {
  status: "running";
}
export type ISequenceTrackerStatus =
  | ISequenceTrackerStatusSuccess
  | ISequenceTrackerStatusError
  | ISequenceTrackerStatusRunning;

export interface ISequenceTrackerRequest {
  status: ISequenceTrackerStatus;
  firebaseSecretLocation?: string;
}

export type IExpectedHeaders = IHttpRequestHeaders & IDictionary;

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
 * Highlights the most likely props coming in from a request but allows
 * additional properties to be defined too.
 */
export type IWrapperRequestHeaders =
  | IExpectedHeaders
  | IOrchestratedHeaders
  | IAWSLambdaProxyIntegrationRequest["headers"];

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
export type OrchestratedCondition = <T>(parameters: T, seq: LambdaSequence) => Promise<boolean>;

/**
 * This is a antiquated request form which should not be used anymore
 */
export type IBareRequest<T> = T & {
  _sequence?: ILambdaSequenceStep[];
};

export type IOrchestrationRequestTypes<T> =
  | IOrchestratedRequest<T>
  | IBareRequest<T>
  | IAWSLambdaProxyIntegrationRequest
  | IAwsLambdaProxyRequestContextV2
  | IStepFunctionTaskRequest<T>;

export interface ILambaSequenceFromResponse<T> {
  request: T;
  apiGateway?: IAWSLambdaProxyIntegrationRequest | IAWSLambdaProxyIntegrationRequestV2;
  sequence: LambdaSequence;
  headers: Omit<IOrchestratedHeaders, "X-Correlation-Id"> | IHttpRequestHeaders;
  triggeredBy: AwsResource;
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
 * the `arn` and `params` to pass in. The _parameters_
 * can be either a static value or a function
 */
export interface IServerlessFunctionSignature {
  arn: string;
  /** either a static param or a dynamic "lookup" property */
  params: IDictionary<any | IOrchestratedDynamicProperty>;
}

export interface ISerializedSequenceFalse {
  isSequence: false;
}

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
 *  **IStepFunctionTaskPayload**
 *
 * When making a step function invocation _body_ it's going to be the payload that the user return from his lambda function
 * or it will contain the input that the user receive as `request`
 *
 * It's being described as `payload` because it's a type that is going to be used to wrap the state machine's state and
 * make the user to have the same experience of `fn`-to-`fn` functionality. Ex: (Passing client context props as ssm secrets, correlationId, etc)
 */
export interface IStepFunctionTaskPayload<T> {
  type: "step-fn-message-body";
  body: T;
  headers: IOrchestratedHeaders | ICompressedSection;
}

/** @inheritdoc */
export type IStepFunctionTaskRequest<T> = IStepFunctionTaskPayload<T>;
/** @inheritdoc */
export type IStepFunctionTaskResponse<T> = IStepFunctionTaskPayload<T>;

export type ISerializedSequence = ISerializedSequenceFalse | ISerializedSequenceTrue;

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

export interface IOrchestratedResponse<T> {
  type: "orchestrated-message-body";
  body: T | ICompressedSection;
  sequence: ISerializedSequence | ICompressedSection;
  headers: IOrchestratedHeaders | ICompressedSection;
}
