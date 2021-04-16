import { AwsArn, isArn, AwsArnService } from "common-types";
import { ServerlessError } from "~/errors";
import { IParsedArn } from "~/types";
/**
 * **buildArn**
 *
 * Given the components of ARN, this function will build a
 * fully qualified ARN in the right format.
 */
export function buildArn(parts: Omit<IParsedArn, "arn">): AwsArn {
  const { partition, service, region, account, resource, appName, stage, fn, stepFunction, rest } = parts;
  let separator: string;
  let hasAppName: boolean;
  switch (resource) {
    case "function":
    case "stateMachine":
    case "log-group":
      separator = ":";
      hasAppName = true;
      break;
    case "role":
    case "user":
    case "group":
    case "policy":
    case "event-bus":
      separator = "/";
      hasAppName = false;
      break;
    default:
      separator = ":";
      hasAppName = false;
  }

  const tail = hasAppName
    ? `${separator}${appName}-${stage}${fn || stepFunction || rest}`
    : `${separator}${fn || stepFunction || rest}`;

  const arn = `arn:${partition}:${service}${region ? ":" + region : ":"}:${account}:${resource}${tail}`;
  if (isArn(arn)) {
    return arn;
  } else {
    throw new ServerlessError(
      500,
      `Attempt to build a fully qualified ARN from component parts failed. The components supplied were: ${JSON.stringify(
        parts,
        null,
        2
      )}`,
      "arn/failed-build"
    );
  }
}
