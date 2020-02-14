"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const aws_log_1 = require("aws-log");
const ErrorMeta_1 = require("./errors/ErrorMeta");
const LambdaSequence_1 = require("./LambdaSequence");
const UnhandledError_1 = require("./errors/UnhandledError");
const HandledError_1 = require("./errors/HandledError");
const index_1 = require("./wrapper-fn/index");
const index_2 = require("./errors/index");
const index_3 = require("./sequences/index");
const invoke_1 = require("./invoke");
const aws_log_2 = require("aws-log");
const lodash_get_1 = __importDefault(require("lodash.get"));
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
exports.wrapper = function (fn, options = {}) {
    /** this is the core Lambda event which the wrapper takes as an input */
    return async function (event, context) {
        let result;
        let workflowStatus;
        workflowStatus = "initializing";
        context.callbackWaitsForEmptyEventLoop = false;
        const log = aws_log_1.logger().lambda(event, context);
        const msg = index_1.loggedMessages(log);
        const errorMeta = new ErrorMeta_1.ErrorMeta();
        /** the code to use for successful requests */
        let statusCode;
        workflowStatus = "unboxing-from-prior-function";
        const { request, sequence, apiGateway, headers } = LambdaSequence_1.LambdaSequence.from(event);
        try {
            workflowStatus = "starting-try-catch";
            msg.start(request, headers, context, sequence, apiGateway);
            // const segment = xray.getSegment();
            // segment.addMetadata("initialized", request);
            index_1.saveSecretHeaders(headers, log);
            index_1.maskLoggingForSecrets(index_1.getLocalSecrets(), log);
            //#region PREP
            workflowStatus = "prep-starting";
            const status = index_3.sequenceStatus(log.getCorrelationId());
            const registerSequence = index_1.registerSequence(log, context);
            const invoke = invoke_1.invoke(sequence);
            const claims = JSON.parse(lodash_get_1.default(apiGateway, "requestContext.authorizer.customClaims", "{}"));
            const handlerContext = Object.assign(Object.assign({}, context), { claims,
                log,
                headers, setHeaders: index_1.setFnHeaders, setContentType: index_1.setContentType, database: (config) => index_1.database(config), sequence,
                registerSequence, isSequence: sequence.isSequence, isDone: sequence.isDone, apiGateway,
                getSecrets: index_1.getSecrets, setSuccessCode: (code) => (statusCode = code), isApiGatewayRequest: common_types_1.isLambdaProxyRequest(event), errorMgmt: errorMeta, invoke });
            //#endregion
            //#region CALL the HANDLER FUNCTION
            workflowStatus = "running-function";
            result = await fn(request, handlerContext);
            log.debug(`handler function returned to wrapper function`, { result });
            workflowStatus = "function-complete";
            //#endregion
            //#region SEQUENCE (next)
            if (sequence.isSequence && !sequence.isDone) {
                workflowStatus = "invoke-started";
                const [fn, requestBody] = sequence.next(result);
                msg.startingInvocation(fn, requestBody);
                const invokeParams = await aws_log_2.invoke(fn, requestBody);
                msg.completingInvocation(fn, invokeParams);
                workflowStatus = "invoke-complete";
            }
            else {
                msg.notPartOfExistingSequence();
            }
            //#endregion
            //#region SEQUENCE (orchestration starting)
            if (index_1.getNewSequence().isSequence) {
                workflowStatus = "sequence-starting";
                msg.sequenceStarting();
                const seqResponse = await index_1.invokeNewSequence(result);
                msg.sequenceStarted(seqResponse);
                workflowStatus = "sequence-started";
            }
            else {
                msg.notPartOfNewSequence();
            }
            //#endregion
            //#region SEQUENCE (send to tracker)
            if (options.sequenceTracker && sequence.isSequence) {
                workflowStatus = "sequence-tracker-starting";
                msg.sequenceTracker(options.sequenceTracker, workflowStatus);
                await aws_log_2.invoke(options.sequenceTracker, index_3.buildOrchestratedRequest(status(sequence)));
                if (sequence.isDone) {
                    msg.sequenceTrackerComplete(true);
                }
                else {
                    msg.sequenceTrackerComplete(false);
                }
            }
            //#endregion
            //#region RETURN-VALUES
            workflowStatus = "returning-values";
            if (handlerContext.isApiGatewayRequest) {
                const response = {
                    statusCode: statusCode ? statusCode : result ? common_types_1.HttpStatusCodes.Success : common_types_1.HttpStatusCodes.NoContent,
                    headers: index_1.getResponseHeaders(),
                    body: result ? (typeof result === "string" ? result : JSON.stringify(result)) : ""
                };
                msg.returnToApiGateway(result, index_1.getResponseHeaders());
                log.debug("the response will be", response);
                return response;
            }
            else {
                log.debug(`Returning results to non-API Gateway caller`, { result });
                return result;
            }
            //#endregion
        }
        catch (e) {
            //#region ERROR-HANDLING
            // wrap all error handling in it's own try-catch
            try {
                msg.processingError(e, workflowStatus);
                const found = index_1.findError(e, errorMeta);
                const isApiGatewayRequest = common_types_1.isLambdaProxyRequest(event);
                if (found) {
                    if (!found.handling) {
                        const err = new HandledError_1.HandledError(found.code, e, log.getContext());
                        if (isApiGatewayRequest) {
                            index_2.convertToApiGatewayError(err);
                        }
                        else {
                            throw err;
                        }
                    }
                    if (found.handling && found.handling.callback) {
                        const resolvedLocally = found.handling.callback(e);
                        if (!resolvedLocally) {
                            // Unresolved Known Error!
                            if (isApiGatewayRequest) {
                                return index_2.convertToApiGatewayError(new HandledError_1.HandledError(found.code, e, log.getContext()));
                            }
                            else {
                                throw new HandledError_1.HandledError(found.code, e, log.getContext());
                            }
                        }
                        else {
                            // Known Error was resolved
                            log.info(`There was an error which was resolved by a locally defined error handler`, { error: e });
                        }
                    }
                    if (found.handling && found.handling.forwardTo) {
                        log.info(`Forwarding error to the function "${found.handling.forwardTo}"`, {
                            error: e,
                            forwardTo: found.handling.forwardTo
                        });
                        await aws_log_2.invoke(found.handling.forwardTo, e);
                    }
                }
                else {
                    //#region UNFOUND ERROR
                    log.debug(`An error is being processed by the default handling mechanism`, {
                        defaultHandling: lodash_get_1.default(errorMeta, "defaultHandling"),
                        errorMessage: lodash_get_1.default(e, "message", "no error messsage"),
                        stack: lodash_get_1.default(e, "stack", "no stack available")
                    });
                    //#endregion
                    const handling = errorMeta.defaultHandling;
                    switch (handling.type) {
                        case "handler-fn":
                            //#region handle-fn
                            /**
                             * results are broadly three things:
                             *
                             * 1. handler throws an error
                             * 2. handler returns `true` which means that result should be considered successful
                             * 3. handler returns _falsy_ which means that the default error should be thrown
                             */
                            try {
                                const passed = handling.defaultHandlerFn(e);
                                if (passed === true) {
                                    log.debug(`The error was fully handled by this function's handling function/callback; resulting in a successful condition [ ${result ? common_types_1.HttpStatusCodes.Accepted : common_types_1.HttpStatusCodes.NoContent} ].`);
                                    if (isApiGatewayRequest) {
                                        return {
                                            statusCode: result ? common_types_1.HttpStatusCodes.Accepted : common_types_1.HttpStatusCodes.NoContent,
                                            headers: index_1.getResponseHeaders(),
                                            body: result ? JSON.stringify(result) : ""
                                        };
                                    }
                                    else {
                                        return result;
                                    }
                                }
                                else {
                                    log.debug(`The error was passed to the callback/handler function but it did NOT resolve the error condition.`);
                                }
                            }
                            catch (e2) {
                                // handler threw an error
                                if (isApiGatewayRequest) {
                                    return index_2.convertToApiGatewayError(new UnhandledError_1.UnhandledError(errorMeta.defaultErrorCode, e));
                                }
                                else {
                                    throw new UnhandledError_1.UnhandledError(errorMeta.defaultErrorCode, e);
                                }
                            }
                            break;
                        //#endregion
                        case "error-forwarding":
                            //#region error-forwarding
                            log.debug("The error will be forwarded to another function for handling", { arn: handling.arn });
                            await aws_log_2.invoke(handling.arn, e);
                            break;
                        //#endregion
                        case "default-error":
                            //#region default-error
                            /**
                             * This handles situations where the user stated that if an
                             * "unknown" error occurred that _this_ error should be thrown
                             * in it's place.
                             */
                            handling.error.message = handling.error.message || e.message;
                            handling.error.stack = e.stack;
                            handling.error.type = "default-error";
                            if (isApiGatewayRequest) {
                                return index_2.convertToApiGatewayError(handling.error);
                            }
                            else {
                                throw handling.error;
                            }
                            break;
                        //#endregion
                        case "default":
                            //#region default
                            // log.debug(`Error handled by default policy`, {
                            //   code: errorMeta.defaultErrorCode,
                            //   message: e.message,
                            //   stack: e.stack
                            // });
                            log.info(`the default error code is ${errorMeta.defaultErrorCode}`);
                            log.warn(`the error response will look like:`, index_2.convertToApiGatewayError(new UnhandledError_1.UnhandledError(errorMeta.defaultErrorCode, e)));
                            if (isApiGatewayRequest) {
                                return index_2.convertToApiGatewayError(new UnhandledError_1.UnhandledError(errorMeta.defaultErrorCode, e));
                            }
                            else {
                                throw new UnhandledError_1.UnhandledError(errorMeta.defaultErrorCode, e);
                            }
                            break;
                        //#endregion
                        default:
                            log.debug("Unknown handling technique for unhandled error", {
                                type: handling.type,
                                errorMessage: e.message
                            });
                            throw new UnhandledError_1.UnhandledError(errorMeta.defaultErrorCode, e);
                    }
                }
            }
            catch (errorOfError) {
                /**
                 * All errors end up here and it is the location where conductor-based
                 * error handling can get involved in the error processing flow
                 */
                const conductorErrorHandler = sequence.activeFn && sequence.activeFn.onError && typeof sequence.activeFn.onError === "function"
                    ? sequence.activeFn.onError
                    : false;
                const resolvedByConductor = async () => (conductorErrorHandler ? conductorErrorHandler(e) : false);
                const forwardedByConductor = sequence.activeFn && sequence.activeFn.onError && Array.isArray(sequence.activeFn.onError)
                    ? sequence.activeFn.onError
                    : false;
                if (forwardedByConductor) {
                    await aws_log_2.invoke(...forwardedByConductor);
                }
                else {
                    // Catch errors in error handlers
                    if (errorOfError.type === "unhandled-error" ||
                        errorOfError.type === "handled-error" ||
                        errorOfError.type === "default-error") {
                        throw new index_2.RethrowError(errorOfError);
                    }
                    throw new index_2.ErrorWithinError(e, errorOfError);
                }
            }
        }
    };
    //#endregion
};
//# sourceMappingURL=wrapper.js.map