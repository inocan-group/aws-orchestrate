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
import { PermissionsRunTime, PropertiesTransformerRt, PermissionSet } from "..";

/**
 * A resource from AWS where typing is still generic to the specific `Type`
 */
export interface IGenericResource<T extends string = string> {
  Type: T;
  DeletionPolicy?: string;
  Properties: Record<string, any>;
}

/**
 * A `NamedResource` is a _typed_ AWS resource which has had the non-AWS property
 * `Name` added. This property represents a unique property for a given stack and serves
 * as the base for resulting ARN which will be produced.
 */
export interface INamedResource<TResourceName extends string, TAwsType extends string>
  extends IGenericResource<TAwsType> {
  Name: TResourceName;
}

/**
 * Allows a **resource** to _provide_ a set of permissions used to interact with it.
 * These permission groups will then be offered to both Lambda functions
 * and Step Functions. This function receives all _run time_ properties plus
 * a copy of the _transformed_ properties from the resource.
 * ```ts
 * providePermissions: ({ partition, stage }) => [
 *    allow(`arn:${partition}:ssm:yyy:${name}}-${stage}`)
 *      .to("ssm:GetParameter", "ssm:GetParametersByPath").as("getSecrets"),
 *    allow(`arn:${partition}:ssm:yyy:${name}}-${stage}`)
 *      .to(a => [a.SSM.GET_PARAMETER, a.SSM.PUT_PARAMETER].as("getAndPut")
 * ]
 * ```
 * - where the function is passed the normal run-time dictionary plus a `properties`
 * hash which has all of the run-time properties on the resource
 */
export type ResourceProvidedPermissions<R extends string, T extends IGenericResource> = (
  rt: PermissionsRunTime<T>
) => PermissionSet<R>[];

/**
 * A function which can transform a resources's `properties` when deploying. If defined,
 * responsible for returning a valid set of `Properties` on the AWS resource type.
 *
 * Example:
 * ```ts
 * transformProperties: (rt) => ({...rt, Name: `${name}_${rt.stage}`})
 * ```
 */
export type RuntimeResourceTransformer<R extends INamedResource<string, string>> = (
  rt: PropertiesTransformerRt<R>
) => R["Properties"];

export type DesignTimeCallbacks<R extends string, T extends INamedResource<R, string>> = {
  /**
   * A function which can transform a resources's `properties` when deploying. If defined,
   * responsible for returning a valid set of `Properties` on the AWS resource type.
   *
   * Example:
   * ```ts
   * transformProperties: (rt) => ({...rt, Name: `${name}_${rt.stage}`})
   * ```
   */
  transformResource?: RuntimeResourceTransformer<T>;

  /**
   * Allows a **resource** to _provide_ a set of permissions used to interact with it.
   * These permission groups will then be offered to both Lambda functions
   * and Step Functions. This function receives all _run time_ properties plus
   * a copy of the _transformed_ properties from the resource.
   * ```ts
   * providePermissions: ({ partition, stage }) => [
   *    allow(`arn:${partition}:ssm:yyy:${name}}-${stage}`)
   *      .to("ssm:GetParameter", "ssm:GetParametersByPath").as("getSecrets"),
   *    allow(`arn:${partition}:ssm:yyy:${name}}-${stage}`)
   *      .to(a => [a.SSM.GET_PARAMETER, a.SSM.PUT_PARAMETER].as("getAndPut")
   * ]
   * ```
   * - where the function is passed the normal run-time dictionary plus a `properties`
   * hash which has all of the run-time properties on the resource
   */
  providePermissions?: ResourceProvidedPermissions<R, T>;
};

/**
 * Type utility which adds properties so that
 * at "design time" you can add hooks to the resource's `Properties`
 * property.
 *
 * Where `R` is the resource name, and `T` is the resource itself.
 */
export type AtDesignTime<
  TResourceName extends string,
  TAwsType extends INamedResource<TResourceName, string>
> = TAwsType & {
  Properties: DesignTimeCallbacks<TResourceName, TAwsType>;
};

/**
 * **ResourceProps<T,E>**
 *
 * Type utility which exposes an AWS resource for consumer to fill in. Because
 * sensible defaults are used, the properties will all be made optional and if
 * the second generic -- `E` -- is used then these properties will NOT be provided
 * to the consumer.
 */
export type ResourceProps<T extends IGenericResource, E extends string = never> = E extends never
  ? Partial<AtDesignTime<string, T>["Properties"]>
  : Partial<Omit<AtDesignTime<string, T>["Properties"], E>>;

/**
 * A type utility for CloudFormation resources. It allows you to pass in a
 * strongly typed "name" for the specific resource as well as the "type" of
 * resource.
 *
 * If the _type_ of resource is not recognized then it will type it as a
 * `IGenericResource`.
 */
export type Resource<
  /** the resource name */
  TResourceName extends string,
  /** the resource type */
  TAwsType extends string
> = TAwsType extends `${AwsResourceType.dynamoTable}`
  ? IDynamoDbTableResource<TResourceName>
  : TAwsType extends `${AwsResourceType.s3Bucket}`
  ? IAwsS3Bucket<TResourceName>
  : TAwsType extends `${AwsResourceType.eventBridgeEventBus}`
  ? IAwsEventBus<TResourceName>
  : TAwsType extends `${AwsResourceType.eventBridgeRule}`
  ? IAwsEventRule<TResourceName>
  : TAwsType extends `${AwsResourceType.eventBridgeSchema}`
  ? IAwsEventSchema<TResourceName>
  : TAwsType extends `${AwsResourceType.cognitoIdentityPool}`
  ? IAwsCognitoIdentityPool<TResourceName>
  : TAwsType extends `${AwsResourceType.cognitoUserPool}`
  ? IAwsCognitoUserPool<TResourceName>
  : TAwsType extends `${AwsResourceType.iamRole}`
  ? IAwsIamRole<TResourceName>
  : TAwsType extends `${AwsResourceType.cloudwatchAlarm}`
  ? IAwsCloudwatchAlarm<TResourceName>
  : TAwsType extends `${AwsResourceType.cloudwatchAnomalyDetector}`
  ? IAwsCloudwatchAnomalyDetector<TResourceName>
  : IGenericResource<TAwsType>;

/**
 * The configuration of a serverless _resources_ which will be deployed as part of
 * a stack.
 *
 * This representation is done at _configuration_ time and
 */
export type IStackResource<TResourceName extends string, TAwsType extends string> = {
  /** The unique name of the resource */
  name: TResourceName;
  /** the AWS type of the resource */
  type: TAwsType;
  /** the full AWS resource description */
  resource: Resource<TResourceName, TAwsType>;
} & DesignTimeCallbacks<TResourceName, Resource<TResourceName, TAwsType>>;
