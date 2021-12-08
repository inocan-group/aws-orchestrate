/* eslint-disable unicorn/import-style */
/* eslint-disable unicorn/no-await-expression-member */
import { DefaultStages, IServerlessStack, IStackRuntime } from "~/devops/types";
import { join } from "path";
import git from "simple-git";
import { readFileSync } from "fs";
import { AwsArnPartition, AwsRegion } from "common-types";

/**
 * **getRuntime**
 *
 * Provides a full runtime environment to pass through to finalize the
 * Serverless configuration.
 */
export async function getRuntime<S extends readonly string[] = DefaultStages>(
  /** the configuration provided by a createStack() definition */
  config: IServerlessStack<string, S>,
  /** any CLI options which will override the defaults */
  options: Partial<IStackRuntime<S>>
) {
  const g = git(process.cwd(), {});
  const gitUser = await g.getConfig("user.name");
  const commit = (await g.log({ maxCount: 1, strictDate: true }))?.latest || "unknown";
  const branch = (await g.branch())?.current || "unknown";

  const semver =
    (JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"))?.version as
      | string
      | undefined) || "unknown";

  return {
    profile: config.provider.profile,
    stage: config.provider.stage,
    ...(process.env.AWS_STAGE ? { stage: process.env.AWS_STAGE as keyof S } : {}),
    ...(process.env.AWS_REGION ? { region: process.env.AWS_REGION as AwsRegion } : {}),
    ...(process.env.AWS_ACCOUNT ? { account: process.env.AWS_ACCOUNT } : {}),
    ...(process.env.AWS_PARTITION
      ? { partition: process.env.AWS_PARTITION as AwsArnPartition }
      : {}),
    ...options,
    gitUser,
    commit,
    semver,
    branch,
  };
}
