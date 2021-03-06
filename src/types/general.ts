import { IAwsLambdaProxyIntegrationRequest, Omit, arn } from "common-types";
import { IAwsLogConfig } from "aws-log";
import type { Lambda, StepFunctions } from "aws-sdk";
import type * as AwsXray from "aws-xray-sdk-core/lib/aws-xray";

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

  /**
   * **StepFunctions**
   *
   * If you intend to kick off Step Functions from this lambda you should pass in the
   * StepFunctions class from `aws-sdk`.
   *
   * This allows just the code needed to perform this action be included when you need
   * it and none of it when you don't.
   *
   * ```ts
   * import { StepFunctions } from "aws-sdk";
   * ```
   */
  StepFunctions?: { new (): StepFunctions };

  /**
   * **Lambda**
   *
   * If you intend to asyncronously _invoking_ another Lambda function from this one
   * you should pass in the `Lamda` class from `aws-sdk`.
   *
   * This allows just the code needed to perform this action be included when you need
   * it and none of it when you don't.
   *
   * ```ts
   * import { Lambda } from "aws-sdk";
   * ```
   */
  Lambda?: { new (): Lambda } ;

  /**
   * **XRay**
   *
   * If you intend to use XRay tracing for this function, you should pass in the
   * `XRay` class from `aws-sdk`.
   *
   * This allows just the code needed to perform this action be included when you need
   * it and none of it when you don't.
   *
   * ```ts
   * import { XRay } from "aws-sdk";
   * ```
   */
  XRay?: typeof AwsXray;
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
export enum AwsSource {
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

  /**
   * The caller was a StepFunction task
   */
  StepFunction = "StepFunction",
}

/**
 * A set of string literals constrained by the `AwsResource` enumeration,
 * which attempts to catalog AWS resources which might be calling a given
 * Lambda function.
 */
export type IAwsResource = keyof typeof AwsSource;

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
