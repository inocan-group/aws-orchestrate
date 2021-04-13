import { AwsRegion, IDictionary, AwsAccountId, AwsStage, isAwsRegion } from "common-types";
import { getStage } from "aws-log";
import { ensureFunctionName } from "~/shared/ensureFunctionName";
import { AwsResource, IParsedArn } from "~/types";
import { ServerlessError } from "~/errors";

/**
 * Looks for aspects of the ARN in environment variables
 */
export function getArnComponents() {
  const region = (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION) as AwsRegion | undefined;
  const account = (process.env.AWS_ACCOUNT || process.env.AWS_ACCOUNT_ID) as AwsAccountId | undefined;
  const stage = (process.env.AWS_STAGE ||
    process.env.ENVIRONMENT ||
    process.env.STAGE ||
    process.env.NODE_ENV ||
    getStage()) as AwsStage | undefined;
  const appName = process.env.SERVICE_NAME || process.env.APP_NAME;

  if (region && !isAwsRegion(region)) {
    throw new ServerlessError(
      500,
      `The region "${region}" was detected in the AWS_REGION or AWS_DEFAULT_REGION environment variable but is not a valid region!`,
      "wrapper-fn/invalid-region"
    );
  }

  return { region, account, stage, appName };
}

/** identify the AwsResource by **arn** name regex patterns */
const ResourceArnFormatRegex: IDictionary<RegExp | undefined> = {
  [AwsResource.Lambda]: /arn:aws:lambda:([\w-].*):(\d.*):function:(.*)/,
  [AwsResource.StepFunction]: /arn:aws:states:([\w-].*):(\d.*):stateMachine:(.*)/,
};

const patterns: IDictionary<RegExp> = {
  account: /^\d+$/,
  region: /\s+-\s+-\d/,
  stage: /(prod|stage|test|dev)/,
  appName: /\s+[\s-]*/,
};

/**
 * Takes a "fully qualified" ARN and decomposes it into its constituant parts:
 *
 * - region
 * - account
 * - function name
 * - stage
 * - app name
 */
function parseFullyQualifiedString(arn: string, target: AwsResource): IParsedArn {
  if (!ResourceArnFormatRegex || target in ResourceArnFormatRegex) {
    throw new Error("ApiGateway not supported. Apigateway should be called by http request");
  }
  const re = ResourceArnFormatRegex[target];
  if (!re) {
    throw new ServerlessError(
      500,
      `The AWS resource target of "${target}" did not have a RegExp to help parse the fully qualified ARN`,
      "wrapper-fn/missing-regex"
    );
  }
  // TODO: see if there's not a better way of typing this
  const [_, region, account, remain] = arn.match(re) as [any, AwsRegion, AwsAccountId, string];
  const parts = remain.split("-");
  const fnName = parts[parts.length - 1];
  const stage = parts[parts.length - 2];
  const appName = parts.slice(0, -2).join("-");

  return {
    region,
    account,
    fn: ensureFunctionName(fnName),
    stage,
    appName,
  };
}

function seek(pattern: keyof typeof patterns, partialArn: string) {
  const parts = partialArn.split(":");

  for (const part of parts) {
    const regEx = patterns[pattern];
    if (regEx.test(part)) {
      part;
      continue;
    }
  }

  return "";
}

function parsingError(section: keyof typeof patterns) {
  const e = new Error(
    `Problem finding "${section}" in the partial ARN which was passed in! To aid in ARN parsing, you should have the following ENV variables set: AWS_STAGE, AWS_ACCOUNT, and SERVICE_NAME`
  );
  e.name = "ArnParsingError";
  throw e;
}

/**
 * assumes the input parameter is just the function name
 * and the rest of the ARN can be deduced by environment
 * variables.
 */
function parsePartiallyQualifiedString(fnName: string): IParsedArn {
  const fn = fnName.split(":").pop();
  let output: Partial<IParsedArn> = {
    ...getArnComponents(),
    ...(fn ? { fn: ensureFunctionName(fn) } : {}),
  };

  for (const section of ["region", "account", "stage", "appName"]) {
    if (!Object.keys(output).includes(section)) {
      const found = seek(section, fnName);
      if (found) {
        output = { ...output, [section]: found };
      } else {
        parsingError(section);
      }
    }
  }

  return output as IParsedArn;
}

/**
 * **parseArn**
 *
 * Takes a _partial_ or _fully qualified_ **ARN** string and attempts to build the
 * all the components that constitute a fully qualified ARN (aka., `IParsedArn`).
 */
export function parseArn(arn: string, target: AwsResource = AwsResource.Lambda): IParsedArn {
  const isFullyQualified = arn.slice(0, 3) === "arn";

  return isFullyQualified ? parseFullyQualifiedString(arn, target) : parsePartiallyQualifiedString(arn);
}
