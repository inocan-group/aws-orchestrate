import { IEnvBuildConfig } from "../types/env-types";

/**
 * Provides a _builder pattern_ for configuring your services
 * ENV variables.
 *
 * By using this, you will benefit from _autocomplete_
 * and _typed_ configuration for known ENV variables as well as
 * be aligned on this build system's point of view around
 * STAGE naming conventions.
 *
 * The configuration passed into this file includes:
 *
 * - `stage` - the development stage being built for [ **AWS_STAGE** ]
 * - `region` - the region being built for [ **AWS_REGION** ]
 * - `partition` - the AWS _partition_ which you are using [ **AWS_PARTITION** ]
 */
export function Env(config: IEnvBuildConfig) {}
