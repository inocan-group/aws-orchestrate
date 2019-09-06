import { IAWSLambaContext, IAwsLambdaEvent } from "common-types";
import { IHandlerContext } from "./@types";
/**
 * **wrapper**
 *
 * A higher order function which wraps a serverless _handler_-function with the aim of providing
 * a better typing, logging, and orchestration experience.
 *
 * @param event will be either the body of the request or the hash passed in by API Gateway
 * @param context the contextual props and functions which AWS provides
 */
export declare const wrapper: <I, O>(fn: (event: I, context: IHandlerContext<I>) => Promise<O>) => (event: IAwsLambdaEvent<I>, context: IAWSLambaContext) => Promise<string | O>;
