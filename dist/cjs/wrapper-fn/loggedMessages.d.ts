import { IDictionary } from "common-types";
import { IErrorClass } from "../@types";
import { LambdaSequence } from "../index";
/**
 * A collection of log messages that the wrapper function will emit
 */
export declare const loggedMessages: (log: {
    log: typeof import("aws-log").info;
    debug: typeof import("aws-log").debug;
    info: typeof import("aws-log").info;
    warn: typeof import("aws-log").warn;
    error: typeof import("aws-log").error;
    addToLocalContext: typeof import("aws-log").addToLocalCtx;
    addToMaskedValues: (...props: (string | [string, import("aws-log").IAwsLogMaskingStrategy])[]) => {
        log: typeof import("aws-log").info;
        debug: typeof import("aws-log").debug;
        info: typeof import("aws-log").info;
        warn: typeof import("aws-log").warn;
        error: typeof import("aws-log").error;
        addToLocalContext: typeof import("aws-log").addToLocalCtx;
        addToMaskedValues: any;
        setMaskedValues: (...props: (string | [string, import("aws-log").IAwsLogMaskingStrategy])[]) => {
            log: typeof import("aws-log").info;
            debug: typeof import("aws-log").debug;
            info: typeof import("aws-log").info;
            warn: typeof import("aws-log").warn;
            error: typeof import("aws-log").error;
            addToLocalContext: typeof import("aws-log").addToLocalCtx;
            addToMaskedValues: any;
            setMaskedValues: any;
            pathBasedMaskingStrategy: (strategy: import("aws-log").IAwsLogMaskingStrategy, ...paths: string[]) => void;
            setStrategyForValue: (value: string, strategy: import("aws-log").IAwsLogMaskingStrategy) => void;
            getContext: () => import("aws-log").IAwsLogContext;
            getCorrelationId: typeof import("aws-log").getCorrelationId;
        };
        pathBasedMaskingStrategy: (strategy: import("aws-log").IAwsLogMaskingStrategy, ...paths: string[]) => void;
        setStrategyForValue: (value: string, strategy: import("aws-log").IAwsLogMaskingStrategy) => void;
        getContext: () => import("aws-log").IAwsLogContext;
        getCorrelationId: typeof import("aws-log").getCorrelationId;
    };
    setMaskedValues: (...props: (string | [string, import("aws-log").IAwsLogMaskingStrategy])[]) => {
        log: typeof import("aws-log").info;
        debug: typeof import("aws-log").debug;
        info: typeof import("aws-log").info;
        warn: typeof import("aws-log").warn;
        error: typeof import("aws-log").error;
        addToLocalContext: typeof import("aws-log").addToLocalCtx;
        addToMaskedValues: (...props: (string | [string, import("aws-log").IAwsLogMaskingStrategy])[]) => {
            log: typeof import("aws-log").info;
            debug: typeof import("aws-log").debug;
            info: typeof import("aws-log").info;
            warn: typeof import("aws-log").warn;
            error: typeof import("aws-log").error;
            addToLocalContext: typeof import("aws-log").addToLocalCtx;
            addToMaskedValues: any;
            setMaskedValues: any;
            pathBasedMaskingStrategy: (strategy: import("aws-log").IAwsLogMaskingStrategy, ...paths: string[]) => void;
            setStrategyForValue: (value: string, strategy: import("aws-log").IAwsLogMaskingStrategy) => void;
            getContext: () => import("aws-log").IAwsLogContext;
            getCorrelationId: typeof import("aws-log").getCorrelationId;
        };
        setMaskedValues: any;
        pathBasedMaskingStrategy: (strategy: import("aws-log").IAwsLogMaskingStrategy, ...paths: string[]) => void;
        setStrategyForValue: (value: string, strategy: import("aws-log").IAwsLogMaskingStrategy) => void;
        getContext: () => import("aws-log").IAwsLogContext;
        getCorrelationId: typeof import("aws-log").getCorrelationId;
    };
    pathBasedMaskingStrategy: (strategy: import("aws-log").IAwsLogMaskingStrategy, ...paths: string[]) => void;
    setStrategyForValue: (value: string, strategy: import("aws-log").IAwsLogMaskingStrategy) => void;
    getContext: () => import("aws-log").IAwsLogContext;
    getCorrelationId: typeof import("aws-log").getCorrelationId;
}) => {
    /** a handler function just started executing */
    start(request: IDictionary<any>, headers: IDictionary<any>, context: IDictionary<any>, sequence: LambdaSequence, apiGateway: Pick<import("common-types").IAWSLambdaProxyIntegrationRequest, "resource" | "path" | "httpMethod" | "queryStringParameters" | "pathParameters" | "requestContext" | "isBase64Encoded">): void;
    sequenceStarting(): void;
    sequenceStarted(seqResponse: any): void;
    startingInvocation(arn: string, params: IDictionary<any>): void;
    completingInvocation(arn: string, inovacationResponse: IDictionary<any>): void;
    notPartOfExistingSequence(): void;
    notPartOfNewSequence(): void;
    /**
     * right before forwarding the sequence status to the `sequenceTracker` lambda
     */
    sequenceTracker: (sequenceTracker: string, workflowStatus: string) => void;
    sequenceTrackerComplete(isDone: boolean): void;
    returnToApiGateway: (result: any, responseHeaders: IDictionary<any>) => void;
    /**
     * as soon as an error is detected in the wrapper, write a log message about the error
     */
    processingError: (e: IErrorClass, workflowStatus: string) => void;
};
