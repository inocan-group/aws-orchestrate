import { IDictionary, HttpStatusCodes } from "common-types";
import { ILoggerApi } from "aws-log";
import { IErrorClass, IApiGateway } from "../@types";
import { getNewSequence } from "./sequences";
import { LambdaSequence } from "../index";
import { getRequestHeaders } from "./headers";

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
      `The handler function ${context.functionName} has started.  ${
        sequence.isSequence
          ? ` [ ${log.getCorrelationId()} ].`
          : " [ not part of sequence ]."
      }`,
      {
        request,
        sequence: sequence.toObject(),
        headers,
        apiGateway
      }
    );
  },

  sequenceStarting() {
    const s = getNewSequence();
    log.debug(
      `The NEW sequence this function/conductor registered is about to be invoked`,
      {
        sequence: s.toObject(),
        headersForwarded: Object.keys(getRequestHeaders())
      }
    );
  },

  sequenceStarted(seqResponse: any) {
    log.debug(
      `The NEW sequence this function registered was successfully invoked`,
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
