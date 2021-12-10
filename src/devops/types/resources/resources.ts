import {
  AwsResourceType,
  IDynamoDbTableResource,
  IAwsS3Bucket,
  IAwsCloudwatchAlarm,
  IAwsEventBus,
  IAwsCognitoIdentityPool,
  IAwsCognitoUserPool,
  IAwsIamRole,
  IAwsCloudwatchAnomalyDetector,
  IAwsEventRule,
  IAwsEventSchema,
} from "common-types";
import { IPermissionsRunTime, IResourceRunTime, IServerlessIamRolePolicy, IStackRuntime } from "..";

export interface IGenericResource<T extends string = string> {
  Type: T;
  Properties: Record<string, any>;
}

/**
 * **ResourceProps<T,E>**
 *
 * Type utility which exposes an AWS resource for consumer to fill in. Because
 * sensible defaults are used, the properties will all be made optional and if
 * the second generic -- `E` -- is used then these properties will NOT be provided
 * to the consumer.
 */
export type ResourceProps<T extends IGenericResource, E extends string = never> = E extends never
  ? Partial<T["Properties"]>
  : Partial<Omit<T["Properties"], E>>;

/**
 * Allows a _resource_ to **provide** a set of permissions used to interact with it.
 * These permission groups will then be offered to both Lambda functions
 * and Step Functions. This function receives all _run time_ properties plus
 * a copy of the _transformed_ properties from the resource.
 * ```ts
 * providePermissions(rt) => [
 *    allow("ssm:GetParameter", "ssm:GetParametersByPath").to(self()).as("getSecrets"),
 *    allow("ssm:PutParameter").to(self()).as("addSecret")
 * ]
 * ```
 */
export type ResourceProvidedPermissions<T extends IGenericResource> = (
  rt: IStackRuntime<IPermissionsRunTime<T["Properties"]>>
) => IServerlessIamRolePolicy[];

/**
 * a function which recieves all the "run-time" properties as well as a
 * `properties` property which represents the _design time_ representation
 * of a resources's properties and then returns a transformed version of
 * the same data structure.
 * ```ts
 * transformProperties(rt) => ({...rt, Name: `${name}_${rt.stage}`})
 * ```
 */
export type RuntimeResourceTransformer<T extends IGenericResource> = (
  rt: IStackRuntime<IResourceRunTime<T["Properties"]>>
) => T["Properties"];

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
   * a function which can transform a resources's `properties` when deploying.
   * ```ts
   * transformProperties(rt) => ({...rt, Name: `${name}_${rt.stage}`})
   * ```
   */
  transformResource?: RuntimeResourceTransformer<T>;

  /**
   * Allows a _resource_ to **provide** a set of permissions used to interact with it.
   * These permission groups will then be offered to both Lambda functions
   * and Step Functions. This function receives all _run time_ properties plus
   * a copy of the _transformed_ properties from the resource.
   * ```ts
   * providePermissions(rt) => [
   *    allow("ssm:GetParameter", "ssm:GetParametersByPath").to(self()).as("getSecrets"),
   *    allow("ssm:PutParameter").to(self()).as("addSecret")
   * ]
   * ```
   */
  providePermissions?: ResourceProvidedPermissions<T>;
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
  : T extends AwsResourceType.eventBridgeRule
  ? AtDesignTime<IAwsEventRule<R>>
  : T extends AwsResourceType.eventBridgeSchema
  ? AtDesignTime<IAwsEventSchema<R>>
  : T extends AwsResourceType.cognitoIdentityPool
  ? AtDesignTime<IAwsCognitoIdentityPool<R>>
  : T extends AwsResourceType.cognitoUserPool
  ? AtDesignTime<IAwsCognitoUserPool<R>>
  : T extends AwsResourceType.iamRole
  ? AtDesignTime<IAwsIamRole<R>>
  : T extends AwsResourceType.cloudwatchAlarm
  ? AtDesignTime<IAwsCloudwatchAlarm<R>>
  : T extends AwsResourceType.cloudwatchAnomalyDetector
  ? AtDesignTime<IAwsCloudwatchAnomalyDetector<R>>
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
  resource: ResourceProperties<R, T>;
};
