import { AwsResource } from "common-types";
import { ServerlessError } from "~/errors";

/**
 * **extractResource**
 *
 * Extracts the AWS _resource_ from a ARN string, returning
 * the _pre_ and _post_ string values along with the resource value.
 */
export function extractResource(arn: string): { pre: string; resource: AwsResource; post: string } {
  const error = new ServerlessError(
    500,
    `Failed to extract a "resource" from the ARN string "${arn}"`,
    "arn/missing-resource"
  );
  const re = /(.*)(function|logs|states|user|group|stateMachine|event-bus|table|role)(.*)/;
  if (!re.test(arn)) {
    throw error;
  }
  const [_, pre, resource, post] = arn.match(re) as [string, string, AwsResource, string];

  return { pre, resource, post };
}
