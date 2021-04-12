import { IAwsLambdaProxyIntegrationRequest, IServerlessFunction, Omit, arn } from "common-types";
import { IAwsLogConfig } from "aws-log";
import { IHandlerContext } from "./wrapper-context";

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
  /**
   * Another lambda -- or at least no other recognized caller -- called
   * the handler function.
   */
  Lambda = "Lambda",
  /**
   * When using `aws-orchestrate` and a Lambda function invokes another
   * Lambda, it will offset the request into a `body` object and add `headers`
   * too so that things like SSM secrets can be passed through.
   */
  LambdaWithHeader = "LambdaWithHeader",
  /**
   * The caller came via API Gateway.
   */
  ApiGateway = "ApiGateway",
}

/**
 * A set of string literals constrained by the `AwsResource` enumeration,
 * which attempts to catalog AWS resources which might be calling a given
 * Lambda function.
 */
export type IAwsResource = keyof typeof AwsResource;

/**
 * Historically, when you used API Gateway you were developing with the
 * REST API but now you can choose between the REST and HTTP API's. This
 * enumeration captures the full set of possible API styles supported.
 *
 * > We need to add WS support
 */
export enum AwsApiStyle {
  /** API Gateway called using the traditional REST API */
  RestApi = "RestApi",
  /** API Gateway called using the more modern HTTP API */
  HttpApi = "HttpApi",
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
