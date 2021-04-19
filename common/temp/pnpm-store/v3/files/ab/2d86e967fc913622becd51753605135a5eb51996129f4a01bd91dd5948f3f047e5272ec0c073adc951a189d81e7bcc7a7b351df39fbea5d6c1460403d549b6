import { IDoConfig } from "../../@types";
export interface IGetConfigOptions {
    exitIfNotFound: boolean;
}
/**
 * **getConfig**
 *
 * Gets the current configuration based on the `do.config.js` file.
 *
 * By default the configuration that will be loaded is the project's
 * configuration but you can state to instead use the `user` config
 * or `both`. In the case of `both`, the two config's will be merged
 * and the project config will take precedence.
 */
export declare function getConfig(userOrProject?: "user" | "project" | "both"): Promise<IDoConfig>;
