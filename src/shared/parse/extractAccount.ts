import { AwsAccountId } from "common-types";
import { ServerlessError } from "~/errors";

/**
 * **extractAccount**
 *
 * Extracts the AWS _account_ from a ARN string, returning
 * the _pre_ and _post_ string values along with the account ID.
 */
export function extractAccount(arn: string): { pre: string; account: AwsAccountId; post: string } {
  const error = new ServerlessError(
    500,
    `Failed to extract an "account" from the ARN string "${arn}"`,
    "arn/missing-account"
  );
  const re = /(.*:)(\d{4,20}|aws)(:.*)/;
  if (!re.test(arn)) {
    throw error;
  }
  const [_, pre, account, post] = arn.match(re) as [string, string, AwsAccountId, string];

  return { pre, account, post };
}
