import {
  AwsRegion,
  AwsAccountId,
  AwsStage,
  AwsArn,
  AwsArnLambda,
  AwsArnPartition,
  AwsArnService,
  AwsArnResource,
  AwsGlobalArn,
  AwsArnDynamoDb,
  AwsArnStepFunction,
} from "common-types";

export interface IBaseParsedArn {
  partition: AwsArnPartition;
  service: AwsArnService;
  resource: AwsArnResource;
  account: AwsAccountId;
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
  stepFunction: undefined;
  rest: undefined;
  arn: AwsArnLambda;
}

export interface IParsedStepFunctionArn extends IBaseParsedArn {
  service: "states";
  resource: "stateMachine";
  region: AwsRegion;
  stage: AwsStage;
  appName: string;
  stepFunction: string;
  fn: undefined;
  rest: undefined;
  arn: AwsArnStepFunction;
}

export interface IParsedDynamoTableArn extends IBaseParsedArn {
  service: "dynamodb";
  resource: "table";
  region: AwsRegion;
  stage?: AwsStage;
  appName?: string;
  fn: undefined;
  stepFunction: undefined;
  /**
   * The unparsed part of the ARN
   */
  rest: string;
  arn: AwsArnDynamoDb;
}

export interface IParsedRegional extends IBaseParsedArn {
  region: AwsRegion;
  stage?: AwsStage;
  appName?: string;
  fn: undefined;
  stepFunction: undefined;
  /**
   * The unparsed part of the ARN
   */
  rest: string;
  arn: AwsArn;
}
export interface IParsedGlobal extends IBaseParsedArn {
  region: false;
  stage?: AwsStage;
  appName?: string;
  /**
   * The unparsed part of the ARN
   */
  rest: string;
  fn: undefined;
  stepFunction: undefined;
  arn: AwsGlobalArn;
}

/**
 * Provides both a fully qualified ARN string but also breaks out each
 * component part of the ARN into a dictionary.
 */
export type IParsedArn =
  | IParsedFunctionArn
  | IParsedStepFunctionArn
  | IParsedRegional
  | IParsedGlobal;
