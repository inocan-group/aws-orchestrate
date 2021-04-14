import { IDictionary } from "common-types";
import { logger } from "aws-log";
import { StartExecutionOutput } from "aws-sdk/clients/stepfunctions";
import { AwsSource } from "~/types";
import { parseArn } from "~/shared";
import { buildStepFunctionRequest } from "./buildStepFunctionRequest";

export async function invokeStepFn(stepArn: string, request: IDictionary) {
  const stepFunction = new (await import("aws-sdk")).StepFunctions({ params: { foo: "bar" } });
  return new Promise<StartExecutionOutput>((resolve, reject) => {
    stepFunction.startExecution(
      buildStepFunctionRequest(parseArn(stepArn, AwsSource.StepFunction), request),
      (error, data) => {
        if (error) {
          const log = logger().reloadContext().addToLocalContext({ workflow: "aws-log/stepFunction" });
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
