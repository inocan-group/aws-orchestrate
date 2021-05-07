import { IServerlessYaml } from "common-types";
import { IServerlessContext } from "~/devops/types/serverless-types";

export type ServerlessBuilder = (b: IServerlessContext) => IServerlessYaml;

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

// const linkedTable = Table(c => c.stack('foo-bar').addColumn('string', ) )
// const tablePermissions = IAM(i => i.addTable(linkedTable, {}));
// const files = S3(s => s.addBucket('my-files'));
// const

// Serverless( c => c.lambda({ memorySize: 1024 }).stepFns({}))
