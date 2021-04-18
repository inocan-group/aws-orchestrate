import { ILoggerApi } from "aws-log";
import { IAwsLambdaContext } from "common-types";
import type { ErrorMeta } from "~/wrapper-fn/util";
import { setContentType, addCookie, setUserHeaders } from "~/wrapper-fn/util/headers";
import { getSecrets } from "~/wrapper-fn/util/secrets";
import { IInvokeLambda, IInvokeStepFunction } from "./invocation-types";
import { IPathParameters, IQueryParameters, IRequestState } from "./wrapper-types";

/**
 * The _functions_ provided by the wrapper function that are provided
 * to all users of the wrapper regardless of who the caller is.
 */
export interface IWrapperContextFunctions<I, O> {
  /**
   * **log**
   *
   * The logging API. It has a largish surface area but for most users the
   * key interface is fairly typical for a logging API (aka, severity based
   * methods):
   *
   * - `debug` - log at the debugging level
   * - `info` - log at the info level
   * - `warn` - log at the warning level
   * - `error` - log at the error level
   *
   * What severity level is actually sent to AWS's cloudwatch logs is based on
   * how you configure it and what _stage_ you're executing in. Refer to the
   * docs for more on this.
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
   * left off then it will return `200` (or `204` if no content is returned).
   *
   * **Note:** this is available to functions regardless of _caller_ but really only
   * makes sense when returning from an API Gateway caller (both HTTP and REST API's).
   * That said, it is completely non-destructive for non API Gateway callers.
   */
  setSuccessCode: (code: number) => void;

  /**
   * **errorMgmt**
   *
   * Allows you to manage how to handle errors which are encountered; both _expected_
   * and _unexpected_ are captured and each can be handled in whatever way you prefer.
   *
   * Read the [docs]() for more info.
   */
  errorMgmt: ErrorMeta<I, O>;
  /**
   * **setContentType**
   *
   * If your handler function is responding to an API-Gateway request, we default to assuming
   * that you'll be returning `application/json` as a content-type for _non-GET_ based requests
   * but you can specify a different content-type as appropriate.
   *
   * **Note:** if you set this for a non API-Gateway caller it will have no effect.
   */
  setContentType: typeof setContentType;
  /**
   * **addHeaders**
   *
   * Most of the required headers sent back to **API Gateway** will be provided automatically
   * (e.g., CORS, correlationId, content-type, etc.) but if your function needs to send
   * additional headers then you can add them here.
   */
  setHeaders: typeof setUserHeaders;

  /**
   * **addCookie**
   *
   * Provides a convenient way to add cookies to the response object's headers.
   * This feature will only work in a meaningful way when replying to a caller from
   * API Gateway.
   */
  addCookie: typeof addCookie;

  /**
   * **invoke**
   *
   * Invoke another Lambda function asynchronously.
   *
   * **Note:** you may only use this endpoint if you're passed in AWS's `Lambda`
   * class into the wrapper's option hash.
   */
  invoke: IInvokeLambda;

  invokeStepFn: IInvokeStepFunction;
}

/** properties that wrapper function adds to the AWS context */
export type IWrapperContextProps<Q extends IQueryParameters, P extends IPathParameters> = Omit<
  IRequestState<any, Q, P>,
  "request"
> & { correlationId: string };

/**
 * The AWS `context` plus additional properties/functions that the `wrapper`
 * function provides.
 */
export type IWrapperContext<
  I,
  O,
  Q extends IQueryParameters = IQueryParameters,
  P extends IPathParameters = IPathParameters
> = Omit<IAwsLambdaContext, "identity"> &
  IWrapperContextProps<Q, P> &
  IWrapperContextFunctions<I, O>;
