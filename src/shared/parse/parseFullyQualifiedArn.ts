import { AwsArn } from "common-types";
import { IParsedArn } from "~/types";

import {
  extractPartition,
  extractService,
  extractStage,
  extractRegion,
  extractResource,
  extractAccount,
} from "./index";
import { buildArn } from "~/shared";
import { ServerlessError } from "~/errors";

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
export function parseFullyQualifiedArn(arn: AwsArn): IParsedArn {
  const { partition } = extractPartition(arn);
  const { service } = extractService(arn);
  const { resource, post: rest } = extractResource(arn);
  const { stage } = extractStage(arn);
  const { region } = extractRegion(arn);
  const { account } = extractAccount(arn);
  // Once extracting all core AWS components we need to then
  // to tease out how to think of the remaining content
  const parts = stage
    ? rest.replace(/$(:\\)/, "").split(stage)
    : rest
        .replace(/$(:\\)/, "")
        .split(/:\//)
        .map((i) => {
          if (["/", ":"].includes(i.slice(0, 1))) {
            return i.slice(1);
          }
          return i;
        });

  const appName = parts[0];
  const fn = parts[1];
  const stepFunction = parts[1];
  const knownResources = ["function", "stateMachine"];

  const knownDictionary = {
    ...(resource === "function" ? { fn, appName } : {}),
    ...(resource === "stateMachine" ? { stepFunction, appName } : {}),
  };

  if (["function", "stateMachine"].includes(resource) && !stage) {
    throw new ServerlessError(
      500,
      `A serverless ${resource} is expected to have a valid "stage" but it was not found`,
      "arn/missing-stage"
    );
  }

  return knownResources.includes(resource)
    ? {
        partition,
        service,
        resource,
        account,
        ...(region ? { region } : {}),
        ...(stage ? { stage } : {}),
        ...knownDictionary,
        arn: buildArn({ partition, service, region, account, stage, resource, appName, fn }),
      }
    : {
        partition,
        service,
        resource,
        account,
        ...(region ? { region } : {}),
        ...(stage ? { stage } : {}),
        rest,
        arn: buildArn({ partition, service, region, account, stage, resource, appName, fn }),
      };
}
