/**
 * A "feature branch" based sandbox environment in the cloud
 */
export type FeatureSandbox = `f_${string}`;
/**
 * A "user" based sandbox environment in the cloud
 */
export type UserSandbox = `u_${string}`;

/**
 * The _default_ environment **stages** which a serverless stack will be brought through.
 */
export type DefaultStages = ["local" | "dev" | "stage" | "prod" | FeatureSandbox | UserSandbox];
