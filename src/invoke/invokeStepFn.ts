import { IDictionary } from "common-types";
import { logger } from "aws-log";
import { StartExecutionOutput } from "aws-sdk/clients/stepfunctions";
import { parseArn } from "~/shared";
import { buildStepFunctionRequest } from "./buildStepFunctionRequest";

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
export async function invokeStepFn(stepArn: string, request: IDictionary) {
  const stepFunction = new (await import("aws-sdk")).StepFunctions({ params: request });
  return new Promise<StartExecutionOutput>((resolve, reject) => {
    stepFunction.startExecution(
      buildStepFunctionRequest(
        parseArn(stepArn, { service: "states", resource: "stateMachine" }),
        request
      ),
      (error, data) => {
        if (error) {
          const log = logger()
            .reloadContext()
            .addToLocalContext({ workflow: "aws-log/stepFunction" });
          const e = new Error(error.message);
          e.stack = error.stack;
          e.name = "InvocationError";
          log.error(`Problem starting the step function '${stepArn}'`, e);
          reject(e);
        }
        resolve(data);
      }
    );
  });
}
