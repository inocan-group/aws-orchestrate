import { IDictionary, HttpStatusCodes } from "common-types";
import { ILoggerApi } from "aws-log";
import { IErrorClass, IApiGateway } from "../@types";
import { getNewSequence } from "./sequences";
import { LambdaSequence } from "../index";

/**
 * A collection of log messages that the wrapper function will emit
 */
export const loggedMessages = (log: ILoggerApi) => ({
  /** a handler function just started executing */
  start(
    request: IDictionary,
    headers: IDictionary,
    context: IDictionary,
    sequence: LambdaSequence,
    apiGateway: IApiGateway
  ) {
    log.info(
      `The handler function "${context.functionName}" has started execution.  ${
        sequence.isSequence
          ? `This handler is part of a sequence [${log.getCorrelationId()} ].`
          : "This handler was not triggered as part of a sequence."
      }`,
      {
        request,
        sequence: sequence.toObject(),
        headers,
        apiGateway
      }
    );
  },
  newSequenceRegistered() {
    const sequence = getNewSequence();
    log.debug(
      `This function has registered a new sequence with ${sequence.steps.length} steps to be kicked off as part of this function's execution.`,
      { sequence: sequence.toObject() }
    );
  },
  sequenceStarting() {
    log.debug(
      `The new sequence this function registered is being started/invoked`,
      { sequence: getNewSequence().toObject() }
    );
  },

  sequenceStarted(seqResponse: any) {
    log.debug(
      `The new sequence this function registered was successfully started`,
      { seqResponse }
    );
  },
  /**
   * right before forwarding the sequence status to the `sequenceTracker` lambda
   */
  sequenceTracker: (sequenceTracker: string, workflowStatus: string) => {
    log.info(
      `About to send the LambdaSequence's status to the sequenceTracker [ ${sequenceTracker} ]`,
      {
        sequenceTracker,
        workflowStatus
      }
    );
  },
  returnToApiGateway: (result: any, responseHeaders: IDictionary) => {
    log.debug(`Returning results to API Gateway`, {
      statusCode: HttpStatusCodes.Success,
      result: JSON.stringify(result),
      responseHeaders
    });
  },
  /**
   * as soon as an error is detected in the wrapper, write a log message about the error
   */
  processingError: (e: IErrorClass, workflowStatus: string) => {
    const stack = e.stack || new Error().stack;
    log.info(
      `Processing error in handler function; error occurred sometime after the "${workflowStatus}" workflow status: [ ${e.message} ]`,
      {
        errorMessage: e.message,
        stack,
        workflowStatus
      }
    );
  }
});
