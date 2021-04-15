import { AwsArn, IDictionary } from "common-types";

export const DEFAULT_ACCOUNT = "888955399055";

export type IArnTestData = {
  /** test name */
  name: string;
  /** expected values after parsing */
  expected: IDictionary;
  /** ARN being tested */
  arn: AwsArn;
};

export const IamArns: IArnTestData[] = [
  {
    name: "IAM Role with stage",
    expected: {
      resource: "role",
      service: "iam",
      appName: "teepee-services",
      stage: "dev",
      rest: "TeepeeDashservicesDashke-9RYW4W0C9X16",
    },
    arn: `arn:aws:iam::${DEFAULT_ACCOUNT}:role/teepee-services-dev-TeepeeDashservicesDashke-9RYW4W0C9X16` as AwsArn,
  },
];

export const LambdaFunctionArns: IArnTestData[] = [
  {
    name: "with dev stage",
    expected: {
      partition: "aws",
      service: "lambda",
      region: "us-east-1",
      resource: "function",
      appName: "teepee-services",
      stage: "dev",
      fn: "doSomething",
    },
    arn: `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:teepee-services-dev-doSomething` as AwsArn,
  },
  {
    name: "with prod stage",
    expected: {
      partition: "aws",
      service: "lambda",
      region: "us-east-1",
      resource: "function",
      appName: "teepee-services",
      stage: "prod",
      fn: "doSomething",
    },
    arn: `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:teepee-services-prod-doSomething` as AwsArn,
  },
  {
    name: "with developer sandbox",
    expected: {
      partition: "aws",
      service: "lambda",
      region: "us-east-1",
      resource: "function",
      appName: "teepee-services",
      stage: "sb-mary",
      fn: "doSomething",
    },
    arn: `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:teepee-services-sb-mary-doSomething` as AwsArn,
  },
  {
    name: "with non-dasherized appName",
    expected: {
      partition: "aws",
      service: "lambda",
      region: "us-west-1",
      resource: "function",
      appName: "teepee",
      stage: "dev",
      fn: "doSomething",
    },
    arn: `arn:aws:lambda:us-west-1:${DEFAULT_ACCOUNT}:function:teepee-dev-doSomething` as AwsArn,
  },
  {
    name: "with multi-dasherized appName",
    expected: {
      partition: "aws",
      service: "lambda",
      region: "us-west-1",
      resource: "function",
      appName: "teepees-are-us",
      stage: "dev",
      fn: "doSomething",
    },
    arn: `arn:aws:lambda:us-west-1:${DEFAULT_ACCOUNT}:function:teepees-are-us-dev-doSomething` as AwsArn,
  },
];

export const StateMachineArns: IArnTestData[] = [
  {
    name: "with dev stage",
    expected: {
      partition: "aws",
      service: "states",
      region: "us-east-1",
      resource: "stateMachine",
      appName: "teepee-services",
      stage: "dev",
      stepFunction: "itms",
    },
    arn: `arn:aws:states:us-east-1:${DEFAULT_ACCOUNT}:stateMachine:teepee-services-dev-itms` as AwsArn,
  },
  {
    name: "with prod stage",
    expected: {
      partition: "aws",
      service: "states",
      region: "us-east-1",
      resource: "stateMachine",
      appName: "teepee-services",
      stage: "prod",
      stepFunction: "itms",
    },
    arn: "arn:aws:states:us-east-1:888955399055:stateMachine:teepee-services-prod-itms",
  },
  {
    name: "with developer sandbox",
    expected: {
      partition: "aws",
      service: "states",
      region: "us-east-1",
      resource: "stateMachine",
      appName: "teepee-services",
      stage: "sb-ken",
      stepFunction: "itms",
    },
    arn: "arn:aws:states:us-east-1:888955399055:stateMachine:teepee-services-sb-ken-itms",
  },
];
