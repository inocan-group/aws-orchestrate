// import type { IServerlessYaml } from "common-types";
// import type { IServerlessBuilder } from "../types/serverless-types";

import type { IServerlessProvider, IServerlessResources } from "common-types";

export type FeatureSandbox = `f_${string}`;
export type UserSandbox = `u_${string}`;

export type days = number;

export type DefaultStages = ["local" | "dev" | "stage" | "prod" | FeatureSandbox | UserSandbox];

export type IServerlessStack<N extends string, S extends readonly string[] = DefaultStages> = {
  /** name of the stack */
  name: N;
  /**  */
  stages: S;
  stateMachines?: [];
  provider: IServerlessProvider;
  resources: IServerlessResources;
};

export function createStack<S extends string, _F extends readonly string[] = readonly []>(
  name: S,
  profile: string
) {
  // TODO: We were not returning anything. Is this fn really needed?
  const stack: Partial<IServerlessStack<S>> = {
    name,
    provider: {
      name: "aws",
      stage: "dev",
      profile,
      httpApi: {},
    },
  };

  return stack;
}
