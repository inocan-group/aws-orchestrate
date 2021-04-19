import { AwsArnPartition, AwsRegion, AwsStage } from "common-types";

export interface IEnvBuildConfig {
  stage: AwsStage;
  region: AwsRegion;
  partition: AwsArnPartition;
}

export type IEnvConfigApi<S> = {};
