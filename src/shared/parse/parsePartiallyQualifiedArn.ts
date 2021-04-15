import {
  AwsAccountId,
  AwsArn,
  AwsRegion,
  IDictionary,
  isArnService,
  isAwsAccountId,
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
} from "./index";
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

  const arn: Partial<IParsedArn> = {};

  // let partition: AwsPartition;
  // let service: AwsService | undefined;
  // let resource: AwsResource | undefined;
  // let stage: AwsStage | undefined;
  // let account: AwsAccountId | undefined;
  // let region: AwsRegion | undefined;
  // let appName: string | undefined;
  // let fn: string | undefined;

  const requested = partial;

  const env = getArnComponentsFromEnv();
  if (env.stage && isAwsStage(env.stage)) {
    arn.stage = env.stage;
  }

  try {
    if (isArnService(env.service || "")) {
      arn.service = env.service;
    } else {
      const { service } = extractService(partial);
      arn.service = service;
    }
    arn.resource = resourceLookup(arn.service);
  } catch {
    arn.service = "lambda";
    arn.resource = "function";
  }

  const { stage } = extractStage(partial);
  if (isAwsStage(env.stage) || stage) {
    arn.stage = stage ? stage : env.stage;
  }

  if (isAwsAccountId(env.account)) {
    arn.account = env.account;
  }

  if (isAwsRegion(env.region)) {
    arn.region = env.region;
  }

  if (env.appName) {
    arn.appName = env.appName;
  }

  try {
    const r = extractRegion(partial);
    arn.region = r.region;
  } catch {
    arn.region = false;
  }

  arn.partition = env.partition || "aws";

  if (arn.partition && arn.account && arn.service && arn.resource && arn.stage && arn.appName) {
    arn.arn = buildArn(arn as Omit<IParsedArn, "arn">);
    //TODO: investigate as we may be covering up some typing gaps here
    return arn as IParsedArn;
  } else {
    throw new ServerlessError(
      500,
      `Could not correctly build the fully qualified ARN from "${requested}"`,
      "arn/incomplete"
    );
  }
}
