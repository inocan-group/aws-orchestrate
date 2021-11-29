import type { Lambda, StepFunctions } from "aws-sdk";
import { StartExecutionOutput } from "aws-sdk/clients/stepfunctions";
import { IDictionary, IHttpHeaders } from "common-types";

export type LambdaInvocationResponse = Lambda.InvocationResponse;
export type StepFunctionInput = StepFunctions.StartExecutionInput;
export type LambdaInvocation<T = IDictionary, H = IHttpHeaders> = (
  functionArn: string,
  request: T,
  additionalHeaders?: H
) => Promise<LambdaInvocationResponse>;

/**
 * **invokeStepFn**
 *
 * Allows a lambda function to kick off a step function.
 *
 * **Note:** _in order to use this function you must pass in the AWS `StepFunctions`
 * as part of the wrapper configuration. This allows this code to only be included when
 * it is actually needed._
 *
 * ```ts
 * import { StepFunctions } from "aws-sdk";
 * export handler = wrapper(fn, { StepFunctions });
 * ```
 */
export type IInvokeStepFunction = <T extends any>(
  arn: string,
  request: T
) => Promise<StartExecutionOutput>;

export type StepFunctionConfigurator = (StepFunctions?: { new (): StepFunctions }) => IInvokeStepFunction;

export type IInvokeLambda = <T extends any>(
  arn: string,
  request: T
) => Promise<LambdaInvocationResponse>;

/** pass in AWS Lambda class to enable the context's `invoke` method */
export type LambdaInvocationConfigurator = (Lambda?:  { new (): Lambda }) => IInvokeLambda;
