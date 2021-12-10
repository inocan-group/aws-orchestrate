import { AwsResourceType, IAwsS3Bucket } from "common-types";
import type { AtDesignTime, IStackResource, ResourceProps } from "~/devops/types";

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
    providePermissions: (_rt) => {
      return [];
    },
  };

  const resource = config
    ? { ...defaultConfig, Properties: { ...defaultConfig.Properties, ...config } }
    : defaultConfig;

  const info = `s3::bucket(${bucketName})`;

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
    type: AwsResourceType.s3Bucket,
    name: bucketName,
    resource,
    // api,
    toString() {
      return info;
    },
    toJSON() {
      return info;
    },
  } as IStackResource<R, AwsResourceType.s3Bucket>;
}
