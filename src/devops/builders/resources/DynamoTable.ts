import { AwsResourceType, IDynamoDbTableResource, arn } from "common-types";
import type { AtDesignTime, PermissionSet, ResourceProps } from "~/devops/types";
import { DevopsError } from "~/errors";
import { addResource } from "~/devops/builders/resources";
import { allow } from "../permissions/allow";

/**
 * **DynamoTable**
 *
 * Adds a DynamoDB Table to as a resource to your stack
 * ```ts
 * // by itself
 * const resource = DynamoTable("customers");
 * // or in stack definition
 * const stack = createStack("my-stack", "profile")
 *  .addResources(DynamoTable("customers"));
 * ```
 */
export function DynamoTable<R extends string>(
  table: R,
  config?: ResourceProps<IDynamoDbTableResource<R>, "TableName">
) {
  const defaultConfig: AtDesignTime<R, IDynamoDbTableResource<R>> = {
    Type: AwsResourceType.dynamoTable,
    Properties: {
      TableName: `${table}_{{stage}}`,
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      GlobalSecondaryIndexes: [],
      //
      transformResource: ({ properties, stage }) => {
        if (properties?.ProvisionedThroughput) {
          if (properties.BillingMode === "PAY_PER_REQUEST") {
            throw new DevopsError(
              "The provisioned throughput was set but billing mode was set as PAY_PER_REQUEST. Both can not be true.",
              "dynamodb/invalid-config"
            );
          } else {
            properties.BillingMode = "PROVISIONED";
          }
        } else {
          // provisioned throughput not configured
          if (properties?.BillingMode === "PROVISIONED") {
            throw new DevopsError(
              "The billing mode is set as PROVISIONED but you haven't stated details for the provisioned throughput!",
              "dynamodb/invalid-config"
            );
          } else {
            properties.BillingMode = "PAY_PER_REQUEST";
          }
        }
        return {
          ...properties,
          TableName: `${table}_${stage}`,
        };
      },
      providePermissions: ({ partition, stage }) => {
        const arn: arn = `arn:${partition}:dynamo:table:${table}_${stage}`;
        return [
          allow(arn)
            .to((a) => [a.DynamoDB.QUERY, a.DynamoDB.GET_RECORDS])
            .as("queryAndRead"),
          allow(arn)
            .to((a) => [a.DynamoDB.QUERY, a.DynamoDB.GET_RECORDS, a.DynamoDB.SCAN])
            .as("queryScanAndRead"),
          allow(arn)
            .to((a) => [
              "dynamodb:Describe*",
              a.DynamoDB.UPDATE_TABLE,
              a.DynamoDB.CREATE_TABLE,
              a.DynamoDB.DELETE_TABLE,
              a.DynamoDB.LIST_TABLES,
              a.DynamoDB.TAG_RESOURCE,
              a.DynamoDB.UNTAG_RESOURCE,
            ])
            .as("admin"),
          allow(arn).to("dynamodb:*").as("all"),
        ] as PermissionSet<R>[];
      },
    },
  };

  const resource = config
    ? { ...defaultConfig, Properties: { ...defaultConfig.Properties, ...config } }
    : defaultConfig;

  const pk = resource.Properties.KeySchema.find((i) => i.KeyType === "HASH");
  const sk = resource.Properties.KeySchema.find((i) => i.KeyType === "RANGE");
  const gsi = resource.Properties.GlobalSecondaryIndexes?.shift();
  const lsi = resource.Properties.LocalSecondaryIndexes?.shift();
  const gsi1 = gsi //
    ? `${gsi ? `::gsi1('${gsi?.IndexName + ":" + gsi?.KeySchema.join("/")}')` : ""}`
    : "";
  const lsi1 = lsi //
    ? `${lsi ? `::lsi1('${lsi?.IndexName + ":" + lsi?.KeySchema.join("/")}')` : ""}`
    : "";

  const info = `dynamodb::table(${table})::pk('${pk?.AttributeName}')${
    sk ? `::sort('${pk?.AttributeName}')${gsi1}${lsi1}` : ""
  }`;

  // const api: IDynamoTableApi = {
  //   provision(read: number, write: number) {
  //     resource.Properties.ProvisionedThroughput = {
  //       ReadCapacityUnits: read,
  //       WriteCapacityUnits: write,
  //     };
  //     resource.Properties.BillingMode = "PROVISIONED";
  //   },
  // };

  return addResource(table as R, resource, info);
}
