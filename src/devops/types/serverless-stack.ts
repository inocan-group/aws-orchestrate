import type {
  IServerlessProvider,
  IServerlessResources,
  IServerlessStepFunctions,
  IServerlessFunctionConfig,
  IServerlessIamConfig,
} from "../types";

/**
 * A "feature branch" based sandbox environment in the cloud
 */
export type FeatureSandbox = `f_${string}`;
/**
 * A "user" based sandbox environment in the cloud
 */
export type UserSandbox = `u_${string}`;

export type days = number;

/**
 * The _default_ environment **stages** which a serverless stack will be brought through.
 */
export type DefaultStages = ["local" | "dev" | "stage" | "prod" | FeatureSandbox | UserSandbox];

export type IServerlessStack<N extends string, S extends readonly string[] = DefaultStages> = {
  /** name of the stack */
  name: N;
  provider: IServerlessProvider<S>;
  resources: IServerlessResources;
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
    prepareLambda: () => IStackApi<N, S, E | "prepareLambda">;
    /**
     * Add a step function to your configuration
     */
    addStepFunction: () => IStackApi<N, S, E>;

    /**
     *
     */
    resources: (resources?: IServerlessResources) => IStackApi<N, S, E | "resources">;
  },
  E
>;
