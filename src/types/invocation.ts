import type { Lambda } from "aws-sdk";
import { IDictionary, IHttpHeaders } from "common-types";

export type InvocationResponse = Lambda.InvocationResponse;
export type LambdaInvocation<T = IDictionary, H = IHttpHeaders> = (
  functionArn: string,
  request: T,
  additionalHeaders?: H
) => Promise<InvocationResponse>;
