import { AwsPartition } from "common-types";
import { ServerlessError } from "~/errors";

/**
 * **extractPartition**
 *
 * Extracts the _partition_ from a AWS ARN string, returning
 * the _pre_ and _post_ string values along with the partition value.
 */
export function extractPartition(arnPartial: string): { pre: string; partition: AwsPartition; post: string } {
  const error = new ServerlessError(
    500,
    `Failed to extract a "partition" from the ARN string "${arnPartial}"`,
    "arn/missing-partition"
  );
  const re = /(.*)(aws|aws-cn|aws-us-gov):(.*)/;
  if (!re.test(arnPartial)) {
    throw error;
  }
  const [_, pre, partition, post] = arnPartial.match(re) as [string, string, AwsPartition, string];

  return { pre, partition, post };
}
