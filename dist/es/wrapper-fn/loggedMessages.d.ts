import { IDictionary } from "common-types";
import { IApiGateway, IErrorClass, LambdaSequence } from "../private";
import { ILoggerApi } from "aws-log";
/**
 * A collection of log messages that the wrapper function will emit
 */
export declare const loggedMessages: (log: ILoggerApi) => {
    /** a handler function just started executing */
    start(request: IDictionary, headers: IDictionary, context: IDictionary, sequence: LambdaSequence, apiGateway: IApiGateway): void;
    sequenceStarting(): void;
    sequenceStarted(seqResponse: any): void;
    startingInvocation(arn: string, params: IDictionary): void;
    completingInvocation(arn: string, inovacationResponse: IDictionary): void;
    notPartOfExistingSequence(): void;
    notPartOfNewSequence(): void;
    /**
     * right before forwarding the sequence status to the `sequenceTracker` lambda
     */
    sequenceTracker: (sequenceTracker: string, workflowStatus: string) => void;
    sequenceTrackerComplete(isDone: boolean): void;
    returnToApiGateway: (result: any, responseHeaders: IDictionary) => void;
    /**
     * as soon as an error is detected in the wrapper, write a log message about the error
     */
    processingError: (e: IErrorClass, workflowStatus: string, isApiGateway?: boolean) => void;
};
