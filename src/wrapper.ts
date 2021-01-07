import {
  ErrorMeta,
  IHandlerContext,
  IOrchestrationRequestTypes,
  IWrapperOptions,
  LambdaSequence,
  invokeSequence,
  IOrchestratedResponse,
  AwsResource,
  IStepFunctionTaskResponse,
} from "./index";

import { sequenceStatus, buildOrchestratedRequest, buildStepFunctionTaskInput } from "./sequences";

import {
  database,
  getLocalSecrets,
  getResponseHeaders,
  getSecrets,
  loggedMessages,
  maskLoggingForSecrets,
  registerSequence as register,
  saveSecretHeaders,
  setContentType,
  setFnHeaders,
  IWrapperErrorContext,
  errorHandling,
  setWorkflowStatus,
  getWorkflowStatus,
} from "./wrapper-fn";

import {
  HttpStatusCodes,
  IAWSLambaContext,
  IApiGatewayErrorResponse,
  IApiGatewayResponse,
  IDictionary,
} from "common-types";
import type { IAdminConfig, IMockConfig } from "universal-fire";

import { get } from "native-dash";
import { logger } from "aws-log";

/**
 * **wrapper**
 *
 * A higher order function which wraps a serverless _handler_-function with the aim of providing
 * a better typing, logging, and orchestration experience.
 *
 * @param req a strongly typed request object that is defined by the `<I>` generic
 * @param context the contextual props and functions which AWS provides plus additional
 * features brought in by the wrapper function
 */
export const wrapper = function <I, O>(
  fn: (req: I, context: IHandlerContext) => Promise<O>,
  options: IWrapperOptions = {}
) {
  /** this is the core Lambda event which the wrapper takes as an input */
  return async function (
    event: IOrchestrationRequestTypes<I>,
    context: IAWSLambaContext
  ): Promise<
    | O
    | IApiGatewayResponse
    | IOrchestratedResponse<O>
    | IStepFunctionTaskResponse<O>
    | IApiGatewayErrorResponse
  > {
    let result: O;
    setWorkflowStatus("initializing");
    context.callbackWaitsForEmptyEventLoop = false;
    const log = logger(options.loggerConfig).lambda(event, context);
    log.info("context object", { context });
    const msg = loggedMessages(log);
    const errorMeta: ErrorMeta = new ErrorMeta();

    /** the code to use for successful requests */
    let statusCode: number;
    setWorkflowStatus("unboxing-from-prior-function");
    const { request, sequence, apiGateway, headers, triggeredBy } = LambdaSequence.from<I>(event);

    let handlerContext: IHandlerContext<I>;

    try {
      setWorkflowStatus("starting-try-catch");
      msg.start(request, headers, context, sequence, apiGateway);
      // const segment = xray.getSegment();
      // segment.addMetadata("initialized", request);
      saveSecretHeaders(headers, log);
      maskLoggingForSecrets(getLocalSecrets(), log);

      // #region PREP
      setWorkflowStatus("prep-starting");
      const status = sequenceStatus(log.getCorrelationId());
      const registerSequence = register(log, context);
      const invoke = invokeSequence(sequence);
      const claims: IDictionary = JSON.parse(
        get(apiGateway, "requestContext.authorizer.customClaims", "{}")
      );

      handlerContext = {
        ...context,
        claims,
        log,
        correlationId: log.getCorrelationId(),
        headers,
        queryParameters: apiGateway?.queryStringParameters || {},
        setHeaders: setFnHeaders,
        setContentType,
        database: (config?: IAdminConfig | IMockConfig) => database(config),
        sequence,
        registerSequence,
        isSequence: sequence.isSequence,
        isDone: sequence.isDone,
        apiGateway,
        getSecrets,
        setSuccessCode: (code: number) => (statusCode = code),
        isApiGatewayRequest: triggeredBy === "ApiGateway",
        errorMgmt: errorMeta,
        invoke,
        triggeredBy,
      };
      //#endregion

 

      //#region RETURN-VALUES
      setWorkflowStatus("returning-values");
      switch (handlerContext.triggeredBy) {
        case AwsResource.ApiGateway:
          const response: IApiGatewayResponse = {
            statusCode: statusCode
              ? statusCode
              : result
              ? HttpStatusCodes.Success
              : HttpStatusCodes.NoContent,
            headers: getResponseHeaders(),
            body: result ? (typeof result === "string" ? result : JSON.stringify(result)) : "",
          };
          msg.returnToApiGateway(result, getResponseHeaders());
          log.debug("the response will be", response);
          return response;
        case AwsResource.StepFunction:
          setWorkflowStatus("returning-values");
          const nextStepTaskInput = buildStepFunctionTaskInput<O>(result);
          log.debug(`Wrap result and pass to the next state machine's task step`, {
            nextStepTaskInput,
          });
          return nextStepTaskInput;
        default:
          log.debug(`Returning results to non-API Gateway caller`, { result });
          return result;
      }
      // #endregion
      // #region ERROR-HANDLING
    } catch (e) {
      const errorContext: IWrapperErrorContext<I> = {
        error: e,
        handlerFunction: context.functionName,
        caller: context.clientContext,
        correlationId: handlerContext.correlationId,
        triggeredBy: handlerContext.triggeredBy,
        awsRequestId: handlerContext.awsRequestId,
        isApiGatewayRequest: handlerContext.isApiGatewayRequest,
        request,
        workflowStatus: getWorkflowStatus(),
      };

      return errorHandling(msg, handlerContext.errorMgmt, errorContext);
    }
    // #endregion ERROR-HANDLING
  };
  // #endregion
};
