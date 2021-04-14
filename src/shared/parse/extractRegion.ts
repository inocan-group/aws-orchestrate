import { AwsRegion, isAwsRegion } from "common-types";
import { ServerlessError } from "~/errors";

/**
 * **extractRegion**
 *
 * Extracts the _region_ from a partial arn string, returning
 * the pre and post string values along with the stage.
 *
 * **Note:** unlike other extractors, if not found it will return a `false` value
 * rather than throw an error. This is because some ARN's (aka, one's with
 * global scope) do not have a region in them.
 */
export function extractRegion(arnPartial: string): { pre: string; region: AwsRegion | false; post: string } {
  const re = /(.*)((us|eu|af|ap|me|sa|ca)-(\w+)-\d)(.*)/;
  if (!re.test(arnPartial)) {
    return { pre: arnPartial, region: false, post: "" };
  }
  const [_, pre, region, post] = arnPartial.match(re) as [string, string, AwsRegion, string];

  if (!isAwsRegion(region)) {
    throw new ServerlessError(
      500,
      `An AWS region was specified but it is not completely valid in structure. Please validate this is a real region: ${region}.`,
      "arn/invalid-region"
    );
  }

  return { pre, region, post };
}
