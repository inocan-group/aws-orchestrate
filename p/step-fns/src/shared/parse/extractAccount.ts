import { AwsAccountId } from "common-types";
import { ServerlessError } from "~/errors";

/**
 * **extractAccount**
 *
 * Extracts the AWS _account_ from a ARN string, returning
 * the _pre_ and _post_ string values along with the account ID.
 */
export function extractAccount(arn: string): { pre: string; account: AwsAccountId; post: string } {
  const re = /arn:aws(.+:)(\d{4,20}|aws)(:.*)/;
  /** finds suspected accounts in more fragmented partial */
  const re2 = /(.*:)(\d{8,16})(:.*)/;

  const fullTest = re.test(arn);

  if (!fullTest && !re2.test(arn)) {
    throw new ServerlessError(
      500,
      `Failed to extract an "account" from the ARN string "${arn}"`,
      "arn/missing-account"
    );
  }

  const [_, pre, account, post] = fullTest
    ? (arn.match(re) as [string, string, AwsAccountId, string])
    : (arn.match(re2) as [string, string, AwsAccountId, string]);

  return { pre, account, post };
}
