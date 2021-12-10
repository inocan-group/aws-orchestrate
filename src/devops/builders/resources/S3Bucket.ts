import { AwsResourceType, IAwsS3Bucket, IDynamoDbTableResource } from "common-types";
import type { AtDesignTime, IStackResource, ResourceProps } from "~/devops/types";
import { DevopsError } from "~/errors";

/**
 * **S3Bucket**
 *
 * Adds an S3 Bucket to a stack configuration
 * ```ts
 * const bucket = S3Bucket("my-objects");
 * ```
 */
export function S3Bucket<R extends string>(
  bucketName: R,
  config?: ResourceProps<IAwsS3Bucket<R>, "BucketName">
): IStackResource<R, AwsResourceType.s3Bucket> {
  const defaultConfig: AtDesignTime<IAwsS3Bucket<R>> = {
    Type: AwsResourceType.s3Bucket,
    Properties: {
      BucketName: `${bucketName}_{{stage}}`,
    },
    transformResource: (rt) => {
      return {
        ...rt.properties,
        BucketName: `${bucketName}-${rt.stage}`,
      };
    },
    permissions: (_rt) => {
      return [];
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

  const info = `s3::bucket(${bucketName})::pk('${pk?.AttributeName}')${
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

  return {
    type: AwsResourceType.dynamoTable,
    name: bucketName,
    resource,
    // api,
    toString() {
      return info;
    },
    toJSON() {
      return info;
    },
  } as IStackResource<R, AwsResourceType.dynamoTable>;
}
