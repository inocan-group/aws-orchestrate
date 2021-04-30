import { IServerlessYaml } from "common-types";
import { IServerlessBuilder } from "../types/serverless-types";

export type ServerlessBuilder = (b: IServerlessBuilder) => IServerlessYaml;

/**
 * A _builder_ for configuring your Serverless Framework based configuration.
 * To use, you will create a `serverless.ts` file which exports something like:
 *
 * ```ts
 * export default Serverless(c => {
 *
 * });
 * ```
 *
 */
export function Serverless(_builder: ServerlessBuilder) {
  console.log("got builder");
}
