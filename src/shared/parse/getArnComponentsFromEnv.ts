import { getStage } from "aws-log";
import { AwsAccountId, AwsRegion, AwsStage, isAwsRegion } from "common-types";
import { ServerlessError } from "~/errors";

/**
 * Looks for aspects of the ARN in environment variables
 */
export function getArnComponentsFromEnv() {
  const partition = process.env.AWS_PARTITION;
  const region = (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION) as AwsRegion | undefined;
  const account = (process.env.AWS_ACCOUNT || process.env.AWS_ACCOUNT_ID) as AwsAccountId | undefined;
  const service = process.env.AWS_DEFAULT_SERVICE;
  const stage = (process.env.AWS_STAGE ||
    process.env.ENVIRONMENT ||
    process.env.STAGE ||
    process.env.NODE_ENV ||
    getStage()) as AwsStage | undefined;
  const appName = process.env.SERVICE_NAME || process.env.APP_NAME;

  if (region && !isAwsRegion(region)) {
    throw new ServerlessError(
      500,
      `The region "${region}" was detected in the AWS_REGION or AWS_DEFAULT_REGION environment variable but is not a valid region!`,
      "wrapper-fn/invalid-region"
    );
  }

  return { partition, region, account, stage, appName, service };
}
