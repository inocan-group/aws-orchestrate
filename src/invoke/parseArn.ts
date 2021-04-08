import { IDictionary } from "common-types";
import { getStage } from "aws-log";
import { ensureFunctionName } from "~/shared/ensureFunctionName";
import { AwsResource } from "~/types";

export interface IParsedArn {
  region: string;
  account: string;
  stage: string;
  appName: string;
  fn: string;
}

export function parseArn(arn: string, target: AwsResource = AwsResource.Lambda): IParsedArn {
  const isFullyQualified = arn.slice(0, 3) === "arn";

  return isFullyQualified ? parseFullyQualifiedString(arn, target) : parsePartiallyQualifiedString(arn);
}

const ResourceArnFormatRegex: IDictionary<RegExp | undefined> = {
  [AwsResource.Lambda]: /arn:aws:lambda:([\w-].*):(\d.*):function:(.*)/,
  [AwsResource.StepFunction]: /arn:aws:states:([\w-].*):(\d.*):stateMachine:(.*)/,
};

function parseFullyQualifiedString(arn: string, target: AwsResource): IParsedArn {
  if (!(target in ResourceArnFormatRegex)) {
    throw new Error("ApiGateway not supported. Apigateway should be called by http request");
  }

  const [_, region, account, remain] = arn.match(ResourceArnFormatRegex[target]);
  const parts = remain.split("-");
  const function_ = parts[parts.length - 1];
  const stage = parts[parts.length - 2];
  const appName = parts.slice(0, -2).join("-");

  return {
    region,
    account,
    fn: ensureFunctionName(function_),
    stage,
    appName,
  };
}

/**
 * assumes the input parameter is just the function name
 * and the rest of the ARN can be deduced by environment
 * variables.
 */
function parsePartiallyQualifiedString(function_: string): IParsedArn {
  const output: IParsedArn = {
    ...getEnvironmentVars(),
    ...{ fn: ensureFunctionName(function_.split(":").pop()) },
  };
  for (const section: keyof IParsedArn of ["region", "account", "stage", "appName"]) {
    if (!output[section]) {
      output[section] = seek(section, function_);
      if (!output[section]) {
        parsingError(section);
      }
    }
  }

  return output;
}

/**
 * Looks for aspects of the ARN in environment variables
 */
export function getEnvironmentVars() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const account = process.env.AWS_ACCOUNT || process.env.AWS_ACCOUNT_ID;
  const stage =
    process.env.AWS_STAGE || process.env.ENVIRONMENT || process.env.STAGE || process.env.NODE_ENV || getStage();
  const appName = process.env.SERVICE_NAME || process.env.APP_NAME;

  return { region, account, stage, appName };
}

const patterns: IDictionary<RegExp> = {
  account: /^\d+$/,
  region: /\s+-\s+-\d/,
  stage: /(prod|stage|test|dev)/,
  appName: /\s+[\s-]*/,
};

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
