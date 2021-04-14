import {
  AwsAccountId,
  AwsArn,
  AwsPartition,
  AwsRegion,
  AwsResource,
  AwsService,
  AwsStage,
  IDictionary,
  isAwsRegion,
  isAwsStage,
} from "common-types";
import { ServerlessError } from "~/errors";
import { IParsedArn } from "~/types";
import {
  extractPartition,
  extractRegion,
  extractStage,
  extractService,
  resourceLookup,
  parseFullyQualifiedArn,
  getArnComponentsFromEnv,
} from ".";
import { buildArn } from "../buildArn";

/**
 * **parsePartiallyQualifiedArn**
 *
 * Attempts to convert a _partial_ ARN into a fully qualified one.
 *
 * > Note: if you a dictionary lookup intended to aid doing lookups
 * you can pass this in and it will prefer this approach.
 */
export function parsePartiallyQualifiedArn(partial: string, lookup?: IDictionary<AwsArn>): IParsedArn {
  if (lookup && lookup[partial as keyof typeof lookup]) {
    return parseFullyQualifiedArn(lookup[partial as keyof typeof lookup]);
  }

  let partition: AwsPartition;
  let service: AwsService | undefined;
  let resource: AwsResource | undefined;
  let stage: AwsStage | undefined;
  let account: AwsAccountId | undefined;
  let region: AwsRegion | undefined;
  let appName: string | undefined;
  let fn: string | undefined;

  const requested = partial;

  const env = getArnComponentsFromEnv();
  if (env.stage && isAwsStage(env.stage)) {
    stage = env.stage;
  }

  try {
    if (env.service) {
      service = env.service;
    } else {
      const [pre, found, post] = extractService(partial);
      partial = pre + post;
      service = found;
    }
    resource = resourceLookup(service);
  } catch {
    service = "lambda";
    resource = "function";
  }

  try {
    const [pre, found, post] = extractStage(partial);
    partial = pre + post;
    stage = env.stage && isAwsStage(env.stage) ? env.stage : found;
  } catch {
    if (!env.stage || !isAwsStage(env.stage)) {
      throw new ServerlessError(
        500,
        `Could not determine the AWS stage from the partial ARN of "${requested}". Try setting the AWS_STAGE env variable to address this.`,
        "arn/no-stage"
      );
    }
  }

  if (env.account && /\d{1,20}/.test(env.account)) {
    account = env.account as AwsAccountId;
  }

  if (env.region && isAwsRegion(env.region)) {
    region = env.region;
  }
  if (env.appName) {
    appName = env.appName;
  }

  try {
    const [pre, found, post] = extractRegion(partial);
    partial = pre + post;
    region = found;
  } catch {
    if (!region) {
      throw new ServerlessError(
        500,
        `Couldn't determine region of ARN based on the following partial: "${requested}"`,
        "parseArn/missing-region"
      );
    }
  }

  try {
    const [pre, found, post] = extractPartition(partial);
    partial = pre + post;
    partition = found;
  } catch {
    partition = "aws";
  }

  if (partition && account && service && resource && stage && appName && fn && region !== undefined) {
    return {
      partition,
      service,
      region,
      stage,
      account,
      resource,
      appName,
      fn,
      arn: buildArn({ partition, service, region, account, stage, resource, appName, fn }),
    };
  } else {
    throw new ServerlessError(
      500,
      `Could not correctly build the fully qualified ARN from "${requested}"`,
      "arn/incomplete"
    );
  }
}
