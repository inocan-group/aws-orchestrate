import { IAWSLambaContext, IAwsLambdaEvent } from "common-types";
import { IHandlerContext } from "./@types";
export declare const wrapper: <I, O>(fn: (event: I, context: IHandlerContext<I>) => Promise<O>) => (event: IAwsLambdaEvent<I>, context: IAWSLambaContext) => Promise<string | O>;
