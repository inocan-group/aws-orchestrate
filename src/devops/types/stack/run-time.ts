import { AwsArnPartition, AwsRegion } from "common-types";
import { INamedResource } from "~/devops/types";

/**
 * The _run time_ configuration of a Serverless stack.
 *
 * The properties typically are derived from ENV variables,
 * option hashes, and sensible defaults.
 */
export type IStackRuntime<K extends {} = {}> = {
  /** the stack name */
  stack: string;
  /** The lifecycle stage the serverless framework CLI is being run in */
  stage: string;

  /** the AWS profile used to credentialize */
  profile: string;

  /** The AWS region */
  region: AwsRegion;
  /** The AWS Account ID */
  account: string;
  /** The AWS Partition for the account */
  partition: AwsArnPartition;

  /** the **git user** who deployed the stack */
  gitUser: string;
  /** The commit hash of the last commit */
  commit: string;
  /** The **semver** version in the package.json */
  semver: string;
  /** The **git** branch the stack is being deployed from */
  branch: string;
} & K;

export type PropertiesTransformerRt<TResource extends INamedResource<string, string>> =
  IStackRuntime<{
    /** the static properties at design time */
    properties: TResource["Properties"];
  }>;

/**
 * The normal run-time information, plus resolved _properties_ for the AWS resource
 */
export type PermissionsRunTime<TResource extends INamedResource<string, string>> = IStackRuntime<{
  /** the resolved properties at run-time */
  properties: TResource["Properties"];
}>;
