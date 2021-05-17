import { logger } from "aws-log";
import type { StepFunctionConfigurator } from "~/types";
import { StartExecutionOutput } from "aws-sdk/clients/stepfunctions";
import { parseArn } from "~/shared";
import { buildStepFunctionRequest } from "./buildStepFunctionRequest";
import { ServerlessError } from "~/errors";
import { AwsArnStepFunction, HttpStatusCodes } from "common-types";

export const configureStepFn: StepFunctionConfigurator = (StepFunctions) => {
  return async function invokeStepFn<T>(arn: string, request: T) {
    if (!StepFunctions) {
      throw new ServerlessError(
        HttpStatusCodes.Forbidden,
        "The handler function attempted to invoke a step function without first passing in the StepFunctions class to the wrapper's option hash.",
        "wrapper-fn/bad-configuration"
      );
    }

    return new Promise<StartExecutionOutput>((resolve, reject) => {
      const sfArn = (parseArn(arn, {
        service: "states",
        resource: "stateMachine",
      }).arn as unknown) as AwsArnStepFunction<"stateMachine">;

      new StepFunctions().startExecution(
        buildStepFunctionRequest(sfArn, request),
        (error, data) => {
          if (error) {
            const log = logger()
              .reloadContext()
              .addToLocalContext({ workflow: "aws-log/stepFunction" });
            const e = new Error(error.message);
            e.stack = error.stack;
            e.name = "InvocationError";
            log.error(`Problem starting the step function '${arn}'`, e);
            reject(e);
          }
          resolve(data);
        }
      );
    });
  };
};
