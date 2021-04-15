import { AwsStage } from "common-types";
import { ServerlessError } from "~/errors";

const RESOURCES_REQUIRING_STAGE = ["function", "stateMachine"];

/**
 * **extractStage**
 *
 * Extracts the _stage_ from a AWS ARN string, returning
 * the pre and post string values along with the stage.
 *
 * Note: it is _convention_ which dictates that AWS Lambda functions (and some other resources)
 * which are deployed using the Serverless framework have a stage as part of their name. In contrast,
 * some ARN resources -- such as IAM roles, etc. -- do not have this.
 */
export function extractStage(arn: string): { pre: string; stage: AwsStage | false; post: string } {
  const re = /(.*)(dev|prod|stage|test|sb-\w{1,20})-(.*)/;
  if (!re.test(arn)) {
    for (const resource of RESOURCES_REQUIRING_STAGE) {
      if (arn.includes(`${resource}:`)) {
        throw new ServerlessError(
          500,
          `The arn "${arn}" is invalid because no stage was found but it appears to be a "" resource (which requires a stage).`,
          "arn/missing-stage"
        );
      }
    }
    // if it's not a required property then just return false
    return { pre: arn, stage: false, post: "" };
  }
  const [_, pre, stage, post] = arn.match(re) as [string, string, AwsStage, string];

  return { pre, stage, post };
}
