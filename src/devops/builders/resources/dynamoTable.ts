import { DynamoBillingMode, IDynamoDbTableResource } from "common-types";
import { isResource, isRunTimeResource } from "~/devops/type-guards";
import type { RunTime } from "~/devops/types";

export type DynamoDbManaged = {
  Type: never;
  Properties: {
    TableName: never;
  };
};

export type DynamoUnmanaged = DynamoDbManaged & IDynamoDbTableResource;

export function dynamoTable<TResource extends string>(
  table: TResource,
  config?: IDynamoDbTableResource<TResource> | RunTime<IDynamoDbTableResource<TResource>>
) {
  if (isResource(config) || isRunTimeResource(config)) {
    return config;
  }

  const defaultConfig: RunTime<IDynamoDbTableResource<TResource>> = (rt) => ({
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: `${table}-${rt.stage}`,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [],
      KeySchema: [],
      GlobalSecondaryIndexes: [],
    },
  });

  const api = {
    billingMode: (mode: DynamoBillingMode) => {
      // 
    },
    addGSI: ()
  };
}
