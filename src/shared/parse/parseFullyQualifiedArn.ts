import { AwsArn, AwsArnPartition, AwsArnService, AwsStage } from "common-types";
import { IParsedArn } from "~/types";

import {
  extractPartition,
  extractService,
  extractStage,
  extractRegion,
  extractResource,
  extractAccount,
} from "./index";
import { ServerlessError } from "~/errors";

function stripSeparatorsAtExtremes(input: string) {
  return input.replace(/^[/:-]/, "").replace(/[/:-]$/, "");
}

function findAppNameAtStartOfRest(input: string, stage: AwsStage | false) {
  const re = new RegExp(`(.+)-${stage}-`);

  if (stage && re.test(input)) {
    const [_ignore, appName] = input.match(re) as [string, string];
    return {
      appName,
      rest: input.replace(re, ""),
    };
  }

  return {
    appName: undefined,
    rest: input,
  };
}

/**
 * Takes a "fully qualified" ARN and decomposes it into its constituant parts:
 *
 * - partition
 * - service
 * - region (if local service)
 * - account
 * - stage
 * - app name
 * - function name
 */
export function parseFullyQualifiedArn<S extends AwsArnService = AwsArnService>(
  arn: AwsArn<string, AwsArnPartition, S>
): IParsedArn {
  const { partition } = extractPartition(arn);
  const { service } = extractService(arn);
  const { resource, post: rest } = extractResource(arn);
  const { stage } = extractStage(arn);
  const { region } = extractRegion(arn);
  const { account } = extractAccount(arn);
  // Once extracting all core AWS components we need to then
  // to tease out how to think of the remaining content
  const parts = stage
    ? rest
        .replace(/$(:\\)/, "")
        .split(stage)
        .map((i) => stripSeparatorsAtExtremes(i))
    : rest
        .replace(/$(:\\)/, "")
        .split(/:\//)
        .map((i) => stripSeparatorsAtExtremes(i));

  const appName = parts[0];
  const fn = resource === "function" ? parts[1] : undefined;
  const stepFunction = resource === "stateMachine" ? parts[1] : undefined;
  const knownResources = ["function", "stateMachine"];

  if (["function", "stateMachine"].includes(resource) && !stage) {
    throw new ServerlessError(
      500,
      `A serverless ${resource} is expected to have a valid "stage" but it was not found`,
      "arn/missing-stage"
    );
  }

  const parsed: Partial<IParsedArn> = {
    partition,
    service,
    resource,
    account,
    arn,
  };

  parsed.region = region ? region : undefined;
  parsed.stage = stage ? stage : undefined;
  const found = findAppNameAtStartOfRest(stripSeparatorsAtExtremes(rest), stage);

  parsed.appName = found.appName;

  const knownDictionary = knownResources.includes(resource)
    ? {
        ...(resource === "function"
          ? { fn, appName, stepFunction: undefined, rest: undefined }
          : {}),
        ...(resource === "stateMachine"
          ? { stepFunction, appName, fn: undefined, rest: undefined }
          : {}),
      }
    : { rest: found.rest, fn: undefined, stepFunction: undefined };

  return { ...parsed, ...knownDictionary } as IParsedArn;
}
