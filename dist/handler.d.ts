import { IAWSLambaContext, IAwsLambdaEvent } from "common-types";
import { IHandlerContext } from "./@types";
export declare const handler: <I, O>(fn: (event: I, context: IHandlerContext) => Promise<O>) => (event: IAwsLambdaEvent<I>, context: IAWSLambaContext) => Promise<string | O>;
