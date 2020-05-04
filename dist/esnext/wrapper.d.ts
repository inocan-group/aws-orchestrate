import { IAWSLambaContext, IApiGatewayResponse, IApiGatewayErrorResponse, IDictionary } from "common-types";
import { IHandlerContext, IWrapperOptions, IOrchestrationRequestTypes } from "./@types";
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
export declare const wrapper: <I, O>(fn: (req: I, context: IHandlerContext<IDictionary<any>>) => Promise<O>, options?: IWrapperOptions) => (event: IOrchestrationRequestTypes<I>, context: IAWSLambaContext) => Promise<IApiGatewayResponse | O | IApiGatewayErrorResponse<any>>;
