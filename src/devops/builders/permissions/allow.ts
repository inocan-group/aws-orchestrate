import { arn } from "common-types";
import { actions as Actions, conditions as _Condition } from "cdk-iam-actions";
import type {
  AwsActions,
  IamAction,
  PermissionSet,
  ProduceIamActions,
} from "~/devops/types/permissions";

export type AllowApi<E extends string = never> = Omit<
  {
    /** IAM actions/permissions which are being allowed */
    to: ProduceIamActions<AllowApi<"to">>;
    /**
     * Use this to deny some of the permissions you allowed
     * in the step before.
     */
    butDeny: ProduceIamActions<AllowApi<E | "butDeny">>;
    withConditions: any;
    /**
     * Provide a human friendly name which **Lambda** and **StepFunctions** will refer to
     * when _recieving_ the permission set and then this function will return the `PermissionSet`
     * to finish off this permissions group.
     */
    as<T extends string>(knownAs: T): PermissionSet<T>;
  },
  E
>;

function usesFunctionSignature(
  x: IamAction[] | [(a: AwsActions) => IamAction[]]
): x is [(actions: AwsActions) => IamAction[]] {
  return typeof x[0] === "function";
}

const api = <E extends string = never>(
  resource: arn,
  allows: IamAction[] = [],
  denies: IamAction[] = [],
  conditions: any[] = []
): AllowApi<E> => {
  return {
    to(...allowed) {
      return api<"to">(
        resource,
        (usesFunctionSignature(allowed) ? allowed[0](Actions) : allowed) as IamAction[],
        denies,
        conditions
      );
    },
    butDeny(...deny) {
      return api<E | "butDeny">(
        resource,
        allows,
        usesFunctionSignature(deny) ? deny[0](Actions) : deny,
        conditions
      );
    },

    withConditions: (c: any[]) => {
      return api(resource, allows, denies, c);
    },
    as(knownAs) {
      return { name: knownAs, to: resource, allows, denies, conditions } as PermissionSet<T>;
    },
  } as AllowApi<E>;
};

/**
 * A helper function provided to _resources_ to provide permissions
 * to their services.
 * ```ts
 * allow("arn:aws:s3:::my-bucket:*")
 *  .to(a => [a.S3.GET_OBJECT, a.S3.PUT_OBJECT])
 *  .as("readWrite")
 * ```
 */
export function allow(resource: arn) {
  return api<"butDeny" | "as" | "withConditions">(resource);
}
