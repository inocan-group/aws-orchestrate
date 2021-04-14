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
      rest: "teepee-services-dev-TeepeeDashservicesDashke-9RYW4W0C9X16",
    },
    arn: `arn:aws:iam::${DEFAULT_ACCOUNT}:role/teepee-services-dev-TeepeeDashservicesDashke-9RYW4W0C9X16` as AwsArn,
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
      stateMachine: "itms",
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
      stateMachine: "itms",
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
      stateMachine: "itms",
    },
    arn: "arn:aws:states:us-east-1:888955399055:stateMachine:teepee-services-sb-ken-itms",
  },
];
