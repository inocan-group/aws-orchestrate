import { AwsRegion, AwsAccountId, AwsStage } from "common-types";

export interface IParsedArn {
  region: AwsRegion;
  account: AwsAccountId;
  stage: AwsStage | string;
  appName: string;
  fn: string;
}
