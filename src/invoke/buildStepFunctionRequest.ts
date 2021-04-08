import { IDictionary } from "common-types";
import { buildStepFunctionTaskInput } from "~/sequences";
import { IParsedArn } from "./parseArn";

/**
 * buildRequest
 *
 * Builds a request object for the AWS StepFunctions start() method
 * parameters
 *
 * @param arn ta full or partial string representation of the state machine's ARN
 * @param request the dictionary of name/value pairings to be sent
 *    as the EVENT payload to the new Lambda function
 */
export function buildStepFunctionRequest(arn: IParsedArn, request: IDictionary, name?: string) {
  const stateMachineArn = `arn:aws:states:${arn.region}:${arn.account}:stateMachine:${arn.appName}-${arn.stage}-${arn.fn}`;

  const payload = buildStepFunctionTaskInput(request);
  if (request.headers) {
    payload.headers = { ...payload.headers, ...request.headers };
  }

  return {
    stateMachineArn,
    input: JSON.stringify(payload),
    name,
  } as import("aws-sdk").StepFunctions.StartExecutionInput;
}
