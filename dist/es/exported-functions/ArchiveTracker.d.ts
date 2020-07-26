import { IWrapperFunction } from "../@types";
/**
 * Usable as _inline-configuration_ of this function if using the
 * `serverless-microservices` yeoman template.
 */
export declare const ArchiveTrackerConfig: IWrapperFunction;
/**
 * A Serverless handler function that can be added to an existing project
 * so that the Frontend's `transaction` helper can be used to request full
 * Sequence based response codes from an API endpoint instead of just getting
 * a response from the "Conductor" when a sequence kicks off.
 *
 * To use this you must add this function to your project and then when you
 * write serverless functions which are initiating a sequence (aka, a "conductor")
 * then you will define the wrapper like so:
 *
 * ```typescript
 * export handler = wrapper(fn, { archiveTracker: "myFunction" })
 * ```
 *
 * where `myFunction` is the AWS _arn_ for this function. The _arn_ can be a
 * partial arn so long as you are using the appropriate ENV variables to activate
 * partial arns.
 */
export declare const handler: (event: import("../@types").IOrchestrationRequestTypes<void>, context: import("common-types").IAWSLambaContext) => Promise<void | import("common-types").IApiGatewayResponse | import("common-types").IApiGatewayErrorResponse<any>>;
