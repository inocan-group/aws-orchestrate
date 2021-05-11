import { AwsArnStepFunction } from "common-types";
import { StepFunctionInput } from "~/types";

/**
 * **buildStepFunctionRequest**
 *
 * Builds a request object for the AWS StepFunctions start() method
 * parameters
 *
 * @param arn ta full or partial string representation of the state machine's ARN
 * @param request the dictionary of name/value pairings to be sent
 *    as the EVENT payload to the new Lambda function
 */
export function buildStepFunctionRequest<T extends any>(
  stateMachineArn: AwsArnStepFunction<"stateMachine">,
  request: T,
  name?: string
): StepFunctionInput {
  return {
    stateMachineArn,
    input: JSON.stringify(request),
    name,
  };
}
