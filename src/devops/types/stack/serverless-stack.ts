import { DefaultStages, IPrepareFunctions } from "~/devops/types";
import type {
  IServerlessProvider,
  IServerlessStepFunctions,
  IServerlessFunctionConfig,
  IServerlessIamConfig,
} from "~/devops/types";

export type days = number;

export type IStackOptions = {
  /**
   * Part of the devops process is to analyze the source code and identify
   * lambda functions, step-functions, and other AWS resources. When this is
   * detected, Typescript types will be created to aid developers.
   *
   * By default, these types will be saved to `src/types/devops-types.ts` but this
   * can be changed to whatever you prefer. When overriding the default, state a
   * relative path starting from the root of the repo.
   */
  typeFile?: string;
};

export type IServerlessStack<N extends string, S extends readonly string[] = DefaultStages> = {
  /** name of the stack */
  name: N;
  provider: IServerlessProvider<S>;
  resources: any[];
  functions: Record<string, IServerlessFunctionConfig>;
  stepFunctions: IServerlessStepFunctions;
  iam: IServerlessIamConfig;
  plugins: string[];
};

export type IStackApi<
  N extends string,
  S extends readonly string[],
  E extends string = never
> = Omit<
  {
    /**
     * The _read-only_ snapshot of the current stack's configuration
     */
    stack: IServerlessStack<N, S>;
    /**
     * Provide default values for your Lambda functions and then automatically
     * retrieve them from the repo.
     */
    prepareLambda: <T extends string>(
      cb: (api: IPrepareFunctions) => IPrepareFunctions<T>
    ) => IStackApi<N, S, E | "prepareLambda">;
    /**
     * Add a step function to your configuration
     */
    addStepFunction: () => IStackApi<N, S, E>;

    /**
     * Adds a named resource to the stack
     */
    resources: <R extends readonly any[]>(r: R) => IStackApi<N, S, E | "resources">;
  },
  E
>;
