import { AwsService } from "common-types";
import { ServerlessError } from "~/errors";

/**
 * **extractService**
 *
 * Extracts the AWS _service_ from a partial arn string (along with pre and post strings)
 */
export function extractService(arnPartial: string): { pre: string; service: AwsService; post: string } {
  const error = new ServerlessError(
    500,
    `Failed to extract a "service" from the ARN string "${arnPartial}"`,
    "arn/missing-service"
  );
  const re = /(.*)(lambda|iam|logs|states|sqs|sns|dynamodb|events):(.*)/;
  if (!re.test(arnPartial)) {
    throw error;
  }
  const [_, pre, service, post] = arnPartial.match(re) as [string, string, AwsService, string];

  return { pre, service, post };
}
