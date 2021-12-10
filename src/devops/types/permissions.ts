import { arn } from "common-types";
import { actions, conditions } from "cdk-iam-actions";

/**
 * All of the AWS actions in an enum (organized by service)
 */
export type AwsActions = typeof actions;

/**
 * All of the AWS conditions available for policies (organized by service)
 */
export type AwsPolicyConditions = typeof conditions;

/**
 * an IAM action which is of the format: `[service]:[action]` (e.g., `s3:GetObject`)
 */
export type IamAction = `${string}:${string}`;

/**
 * A function which produces IAM actions through two signatures:
 * 1. fn
 * ```ts
 * function fn(a => [ a.S3.GET_OBJECT, a.S3.DELETE_OBJECT ]);
 * ```
 * 2. literal
 * ```ts
 * function fn(...actions: IamAction[]) { ... }
 * ```
 */
export type ProduceIamActions<R extends any = IamAction[]> = <
  T extends IamAction[] | [(a: AwsActions) => IamAction[]]
>(
  ...actions: T
) => R;

export type PermissionSet<T extends string = string> = {
  name: T;
  allows: IamAction[];
  denies: IamAction[];
  conditions: any[];
  to: arn;
};
