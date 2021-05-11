import { isLambdaArn } from "common-types";
import { IParsedFunctionArn } from "~/types";
import { parsePartiallyQualifiedArn, parseFullyQualifiedArn } from "./parse/index";

/**
 * **parseLambdaFunctionArn**
 *
 * Parses the given string into a valid
 */
export function parseLambdaFunctionArn(arn: string) {
  return isLambdaArn(arn)
    ? (parseFullyQualifiedArn<"lambda">(arn) as IParsedFunctionArn)
    : (parsePartiallyQualifiedArn(arn, {
        service: "lambda",
        resource: "function",
      }) as IParsedFunctionArn);
}
