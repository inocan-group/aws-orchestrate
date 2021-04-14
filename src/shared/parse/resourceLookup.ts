import { AwsResource } from "common-types";

/**
 * Given an AWS service name, attempts to pair that to the most common
 * resource name that goes with it. If no match is found it returns
 * undefined.
 */
export function resourceLookup(service: string): AwsResource | undefined {
  const lookup = {
    lambda: "function",
    iam: "user",
    logs: "log-group",
    states: "stateMachine",
    events: "event-bus",
  };

  return Object.keys(lookup).includes(service) ? lookup[service as keyof typeof lookup] : undefined;
}
