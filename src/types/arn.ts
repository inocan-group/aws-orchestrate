import { AwsRegion, AwsAccountId, AwsStage, AwsPartition, AwsService, AwsResource, AwsArn } from "common-types";

export interface IBaseParsedArn {
  partition: AwsPartition;
  service: AwsService;
  resource: AwsResource;
  account: AwsAccountId;
  /**
   * The fully qualified ARN string
   */
  arn: AwsArn;
}

export interface IParsedFunctionArn extends IBaseParsedArn {
  service: "lambda";
  resource: "function";
  /**
   * region will be a valid AWS region or _false_ if the ARN in
   * question is a "global" resource
   */
  region: AwsRegion;
  stage: AwsStage;
  appName: string;
  fn: string;
}

export interface IParsedStepFunctionArn extends IBaseParsedArn {
  service: "states";
  resource: "stateMachine";
  region: AwsRegion;
  stage: AwsStage;
  appName: string;
  stepFunction: string;
}

export interface IParsedDynamoTableArn extends IBaseParsedArn {
  service: "dynamodb";
  resource: "table";
  region: AwsRegion;
  stage?: AwsStage;
  appName?: string;
  rest: string;
}

export interface IParsedRegional extends IBaseParsedArn {
  region: AwsRegion;
  stage?: AwsStage;
  appName?: string;
  /**
   * The unparsed part of the ARN
   */
  rest: string;
}
export interface IParsedGlobal extends IBaseParsedArn {
  region: false;
  stage?: AwsStage;
  appName?: string;
  /**
   * The unparsed part of the ARN
   */
  rest: string;
}

/**
 * Provides both a fully qualified ARN string but also breaks out each
 * component part of the ARN into a dictionary.
 */
export type IParsedArn = IParsedFunctionArn | IParsedStepFunctionArn | IParsedRegional | IParsedGlobal;
