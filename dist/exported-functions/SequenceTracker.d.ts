import { IErrorClass, IWrapperFunction } from "../@types";
export declare const SequenceTrackerConfig: IWrapperFunction;
export interface ISequenceTrackerRequest {
    status: ISequenceTrackerStatus;
    firebaseSecretLocation?: string;
}
export interface ISequenceTrackerStatusBase {
    /**
     * The `correlationId` of the sequence executing
     */
    correlationId: string;
    /**
     * The total number of steps in the sequence
     */
    total: number;
    /**
     * The current step in the sequence
     */
    current: number;
    /**
     * The AWS `arn` of the currently executing function
     */
    currentFn: string;
    /**
     * The AWS `arn` of the function which originated
     * the sequence.
     */
    originFn?: string;
    /**
     * The current status of the sequence
     */
    status: string;
}
export interface ISequenceTrackerStatusSuccess extends ISequenceTrackerStatusBase {
    status: "success";
    data: string;
}
export interface ISequenceTrackerStatusError extends ISequenceTrackerStatusBase {
    status: "error";
    error: IErrorClass;
}
export interface ISequenceTrackerStatusRunning extends ISequenceTrackerStatusBase {
    status: "running";
}
export declare type ISequenceTrackerStatus = ISequenceTrackerStatusSuccess | ISequenceTrackerStatusError | ISequenceTrackerStatusRunning;
/**
 * This function is provided as an _export_ for consumers to use
 * in situations where their handler functions are involved in a
 * `LambdaSequence` and the entry point to the sequence is an **API Gateway**
 * endpoint.
 *
 * The goal of this function is to track -- _step_ by _step_ -- the sequence being
 * executed and eventually to arrive at either a successful or error state. This
 * tracking "state" will be written to the Firebase database so that the frontend/caller
 * of the endpoint can _watch_ this database path to gain a _functional_ understanding
 * of the outcome of the endpoint (rather than just a response that the sequence has
 * been started).
 *
 * To ensure this serverless function is engaged be sure that all handler functions
 * which are starting a `LambdaSequence` wrap themselves with the following option:
 *
 * ```typescript
 * export handler = wrapper(fn, { archiveTracker: "myFunction" })
 * ```
 *
 * where `myFunction` is the AWS _arn_ for **this** function. The _arn_ can be a
 * partial arn so long as you are using the appropriate ENV variables to activate
 * partial arns.
 *
 * For more information see the docs at:
 * [SequenceTracker](aws-orchestrate.netlify.com/transaction#SequenceTracker)
 */
export declare const SequenceTracker: (event: import("../@types").IOrchestrationRequestTypes<ISequenceTrackerRequest>, context: import("common-types").IAWSLambaContext) => Promise<ISequenceTrackerStatusSuccess | ISequenceTrackerStatusError | ISequenceTrackerStatusRunning | import("common-types").IApiGatewayResponse | import("common-types").IApiGatewayErrorResponse<any>>;
