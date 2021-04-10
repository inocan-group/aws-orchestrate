import {
  IAwsLambaContext,
  IAwsLambdaProxyIntegrationRequest,
  IDictionary,
  IServerlessFunction,
  Omit,
  arn,
  IAwsLambdaProxyIntegrationRequestV2,
  IAwsLambdaProxyIntegrationRequestHeaders,
  RestMethod,
} from "common-types";
import { ILoggerApi, IAwsLogConfig } from "aws-log";
import { getSecrets, setContentType, setFnHeaders as setFunctionHeaders } from "~/wrapper-fn";
import { LambdaSequence } from "~/sequences";
import { ErrorMeta } from "~/errors";
import { UnconstrainedHttpHeaders } from "~/invoke";
import { IWrapperRequestHeaders } from "./sequence-types";

type InvocationResponse = import("aws-sdk").Lambda.InvocationResponse;

/**
 * The _meta-data_ for a handler function. This can include a description
 * (strongly suggested), events, timeouts, etc.
 */
export type IHandlerConfig = Omit<IServerlessFunction & { handler: string }, "handler">;

/**
 * The meta-data for a handler function; this symbol is now deprecated
 * in favor of `IHandlerConfig`.
 *
 * @deprecated
 */
export type IWrapperFunction = IHandlerConfig;

/**
 * The API Gateway's _proxy integration request_ structure with the
 * `body` and `headers` removed
 */
export type IApiGateway = Omit<IAwsLambdaProxyIntegrationRequest, "body" | "headers">;

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

  loggerConfig?: Partial<IAwsLogConfig>;
}

/**
 * Configure how an error should be identified; typically you would only
 * use one condition but if multiple are used they are considered an `AND`
 * logical condition
 */
export interface IErrorIdentification {
  errorClass?: new (...arguments_: any) => Error;
  code?: string;
  name?: string;
  messageContains?: string;
}

/**
 * This enum is inteded to be used to determine an specific aws resource.
 * It should be become bigger as we need more resources types
 */
export enum AwsResource {
  Lambda = "Lambda",
  StepFunction = "StepFunction",
  ApiGateway = "ApiGateway",
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
 */
export interface IHandlerContext<Q, P> extends IAwsLambaContext {
  /**
   * The HTTP headers variables passed by caller
   */
  headers: IAwsLambdaProxyIntegrationRequestHeaders | {};
  /**
   * A dictionary of name/value pairs based on the values passed in from the
   * _query parameters_ of the request
   */
  queryParameters: Q | {};
  /**
   * A dictionary of name/value pairs based on the values passed in from the
   * URL/path of the request
   */
  pathParameters: P | {};

  /**
   * If the caller sent in a value in the `Authenticate` header then it will be
   * represented here.
   */
  token: string | undefined;

  /**
   * If the caller is API Gateway, this property will indicate the REST verb used
   * in the call.
   */
  verb: RestMethod | undefined;

  /**
   * The custom claims which this function received from API Gateway.
   *
   * > Note: currently this is only available in REST API's, not HTTP API's.
   */
  claims?: IDictionary;
  /**
   * The sequence which this execution is part of
   */
  sequence: LambdaSequence;
  /**
   * The type of aws resource that triggered the current lambda fn
   */
  triggeredBy: AwsResource;
  /**
   * Check whether the given function execution is part of a
   * sequence
   */
  isSequence: boolean;
  /**
   * The unique `id` assigned to this _sequence_
   */
  correlationId: string;
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
   * The API Gateway "proxy integration" request data; this can be either version 1.0 or 2.0.
   * If the caller is not API Gateway it will be left undefined.
   */
  apiGateway?: IAwsLambdaProxyIntegrationRequest;
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
  setHeaders: typeof setFunctionHeaders;
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
    functionArn: string,
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
export type IHandlerFunction<E, R> = (event: E, context: IHandlerContext) => Promise<R>;

export interface IErrorWithExtraProperties extends Error {
  [key: string]: any;
}
