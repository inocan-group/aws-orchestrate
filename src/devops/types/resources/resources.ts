import {
  arn,
  AwsResourceType,
  IDynamoDbTableResource,
  IAwsS3Bucket,
  IAwsCloudwatchAlarm,
  IAwsEventBus,
  IAwsCognitoIdentityPool,
  IAwsCognitoUserPool,
  IAwsIamRole,
} from "common-types";
import { IServerlessIamRolePolicy, IStackRuntime } from "..";

export interface IGenericResource<T extends string = string> {
  Type: T;
  Properties: Record<string, any>;
}

/**
 * Type utility which adds two optional properties so that
 * at "design time" you can add hooks to react to the specifics
 * provided at "run time" (aka, when you deploy a stack with
 * specific environment considerations like stage, region, etc.)
 *
 * - `runTime` property allows a resource's
 * properties to be _transformed_ at run time when a user
 * deploys.
 * - `permissions` allows adding named permissions to the given
 * resource which provide utility for the resource.
 */
export type AtDesignTime<T extends IGenericResource> = T & {
  /**
   * optionally allow a function to be added which will transform
   * `properties` when deploying.
   */
  runTime?: (rt: IStackRuntime) => Record<string, any>;

  /**
   * Optionally allows any resource to be configured with a set of IAM role permissions
   * which would allow access to this resource. Permissions provided here will
   * be offered to consumers who chose the resource.
   */
  permissions?: (rt: IStackRuntime & { resourceArn: arn }) => IServerlessIamRolePolicy[];
};

/**
 * A type utility for CloudFormation resources. It allows you to pass in a
 * strongly typed "name" for the specific resource as well as the "type" of
 * resource.
 *
 * If the _type_ of resource is not recognized then it will type it as a
 * `IGenericResource`. In all cases, however, an optional property `runTime` will
 * be provided as a callback hook which allows for transforming the resources
 * properties at deployment time.
 */
export type ResourceProperties<
  /** the resource name */
  R extends string,
  /** the resource type */
  T extends string
> = T extends AwsResourceType.dynamoTable
  ? AtDesignTime<IDynamoDbTableResource<R>>
  : T extends AwsResourceType.s3Bucket
  ? AtDesignTime<IAwsS3Bucket<R>>
  : T extends AwsResourceType.eventBridgeEventBus
  ? AtDesignTime<IAwsEventBus<R>>
  : T extends AwsResourceType.cognitoIdentityPool
  ? AtDesignTime<IAwsCognitoIdentityPool<R>>
  : T extends AwsResourceType.cognitoUserPool
  ? AtDesignTime<IAwsCognitoUserPool<R>>
  : T extends AwsResourceType.iamRole
  ? AtDesignTime<IAwsIamRole<R>>
  : T extends AwsResourceType.cloudwatchAlarm
  ? AtDesignTime<IAwsCloudwatchAlarm<R>>
  : AtDesignTime<IGenericResource<T>>;

/**
 * The configuration of a serverless _resources_ which will be deployed as part of
 * a stack.
 *
 * This representation is done at _configuration_ time and
 */
export type IStackResource<R extends string, T extends string> = {
  name: R;
  type: T;
  properties: ResourceProperties<R, T>;
};
