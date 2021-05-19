import { IDictionary } from "common-types";
import { IParsedArn } from "~/types";

/**
 * buildRequest
 *
 * Builds a request object for the AWS Lambda invoke() functions
 * parameters
 *
 * @param arn the ARN identification of the resource being called in
 *    the structured components that parseArn() provides
 * @param request the dictionary of name/value pairings to be sent
 *    as the EVENT payload to the new Lambda function
 */
export function buildInvocationRequest<
  T extends IDictionary 
>(arn: IParsedArn, request: T): import("aws-sdk").Lambda.InvocationRequest {
  const FunctionName = `arn:aws:lambda:${arn.region}:${arn.account}:function:${arn.appName}-${arn.stage}-${arn.fn}`;
  const Payload = JSON.stringify(request);

  return {
    FunctionName,
    Payload,
    LogType: "None",
    InvocationType: "Event",
  };
}
