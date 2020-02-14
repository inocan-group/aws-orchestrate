import { HttpStatusCodes } from "common-types";
import { getNewSequence } from "./sequences";
import { LambdaSequence } from "../index";
import { getRequestHeaders } from "./headers";
import get from "lodash.get";
/**
 * A collection of log messages that the wrapper function will emit
 */
export const loggedMessages = (log) => ({
    /** a handler function just started executing */
    start(request, headers, context, sequence, apiGateway) {
        log.info(`The handler function ${get(context, "functionName")} has started.  ${get(sequence, "isSequence", false) ? ` [ ${log.getCorrelationId()} ].` : " [ not part of sequence ]."}`, {
            request,
            sequence: sequence ? sequence.toObject() : LambdaSequence.notASequence(),
            headers,
            apiGateway
        });
    },
    sequenceStarting() {
        const s = getNewSequence();
        log.debug(`The NEW sequence this function/conductor registered is about to be invoked`, {
            sequence: s.toObject(),
            headersForwarded: Object.keys(getRequestHeaders() || {})
        });
    },
    sequenceStarted(seqResponse) {
        log.debug(`The NEW sequence this function registered was successfully invoked`, { seqResponse });
    },
    startingInvocation(arn, params) {
        log.debug(`sequence: starting invocation of fn: ${arn}`, { arn, params });
    },
    completingInvocation(arn, inovacationResponse) {
        log.info(`sequence: completed invocation of fn: ${arn}`, {
            inovacationResponse
        });
    },
    notPartOfExistingSequence() {
        log.debug(`This function is not part of a (continuing) sequence so skipping the next() invocation code path`);
    },
    notPartOfNewSequence() {
        log.debug(`This function did not kick off a NEW sequence.`);
    },
    /**
     * right before forwarding the sequence status to the `sequenceTracker` lambda
     */
    sequenceTracker: (sequenceTracker, workflowStatus) => {
        log.info(`About to send the LambdaSequence's status to the sequenceTracker [ ${sequenceTracker} ]`, {
            sequenceTracker,
            workflowStatus
        });
    },
    sequenceTrackerComplete(isDone) {
        log.debug(`The invocation to the sequence tracker has completed`, {
            isDone
        });
    },
    returnToApiGateway: (result, responseHeaders) => {
        log.debug(`Returning results to API Gateway`, {
            statusCode: HttpStatusCodes.Success,
            result: JSON.stringify(result || ""),
            responseHeaders
        });
    },
    /**
     * as soon as an error is detected in the wrapper, write a log message about the error
     */
    processingError: (e, workflowStatus, isApiGateway = false) => {
        const stack = get(e, "stack") || new Error().stack;
        const errorMessage = get(e, "message", "no-message");
        log.info(`Processing error in handler function; error occurred sometime after the "${workflowStatus}" workflow status: [ ${errorMessage}}${isApiGateway ? ", ApiGateway" : ""} ]`, {
            errorMessage,
            stack,
            workflowStatus
        });
    }
});
//# sourceMappingURL=loggedMessages.js.map