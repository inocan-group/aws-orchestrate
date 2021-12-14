import { AwsResourceType, IAwsS3Bucket, arn } from "common-types";
import type { AtDesignTime, IStackResource, PermissionSet, ResourceProps } from "~/devops/types";
import { addResource } from "~/devops/builders/resources";
import { allow } from "../permissions/allow";

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
  const defaultConfig: AtDesignTime<R, IAwsS3Bucket<R>> = {
    Type: AwsResourceType.s3Bucket,
    Properties: {
      BucketName: `${bucketName}_{{stage}}`,
      transformResource: ({ properties, stage }) => {
        return {
          ...properties,
          BucketName: `${bucketName}_${stage}`,
        };
      },
      providePermissions: ({ partition, stage }) => {
        const arn: arn = `arn:${partition}:s3:::${bucketName}_${stage}/*`;
        return [
          allow(arn)
            .to((a) => [a.S3.GET_OBJECT, a.S3.LIST_OBJECTS])
            .as("getAndList"),
          allow(arn)
            .to((a) => [a.S3.GET_OBJECT])
            .as("getOnly"),
          allow(arn)
            .to((a) => [a.S3.GET_OBJECT, a.S3.LIST_OBJECTS, a.S3.PUT_OBJECT])
            .as("getPutAndList"),
          allow(arn).to("s3:*").as("all"),
        ] as PermissionSet<R>[];
      },
    },
  };

  const resource: AtDesignTime<R, IAwsS3Bucket<R>> = config
    ? { ...defaultConfig, Properties: { ...defaultConfig.Properties, ...config } }
    : defaultConfig;

  const info = `s3::bucket(${bucketName})`;

  return addResource(bucketName, resource, info) as IStackResource<R, AwsResourceType.s3Bucket>;
}
