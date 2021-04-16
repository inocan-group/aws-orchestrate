import {
  ArnResource,
  ArnService,
  AwsAccountId,
  AwsArn,
  IDictionary,
  isArnService,
  isAwsAccountId,
  isAwsRegion,
  isAwsStage,
} from "common-types";

import { IParsedArn, IParsedFunctionArn, IParsedGlobal, IParsedRegional, IParsedStepFunctionArn } from "~/types";
import {
  extractRegion,
  extractStage,
  extractService,
  resourceLookup,
  parseFullyQualifiedArn,
  getArnComponentsFromEnv,
  extractAccount,
} from "./index";
import { buildArn } from "../buildArn";
import { ServerlessError } from "~/errors";
import { env } from "node:process";

export interface IPartialParseOptions {
  /**
   * If you have a dictionary of abbreviated ARNs that you want to be
   * expanded to a full ARN, you can state that here and it will be
   * used prior to any other matching techniques
   */
  lookup?: IDictionary<AwsArn>;
  /**
   * While we use the `DEFAULT_SERVICE` environment variable to determine
   * service, sometimes it's easier to just pass this in programatically.
   */
  service?: ArnService;

  /**
   * By default we lookup a reasonable default for the "resource" once we've
   * established the "service" but you can pass in an explicit resource if you
   * like.
   */
  resource?: ArnResource;
}

function missingMessage(prop: string, partial: string, envVar: string | string[], all: IDictionary) {
  const ENV = Array.isArray(envVar) ? envVar : [envVar];
  return `While trying to convert the partial ARN ["${partial}"] to a full ARN, the ${prop} was not found, try setting the ${ENV.join(
    ", "
  )} variable to fix this.\n\nRelevant ENV variables which were set:\n${JSON.stringify(all, null, 2)}`;
}

/**
 * **parsePartiallyQualifiedArn**
 *
 * Attempts to convert a _partial_ ARN into a fully qualified one.
 *
 * The primary means of filling in the missing details are ENV variables. These include:
 *
 * - `AWS_PARTITION` - if not set it will default to assuming "aws"
 * - `AWS_DEFAULT_SERVICE` - this will default to `lambda` but whatever you set here will
 *      provide a reasonable default for not only the _service_ but also the _resource_
 *
 * While the previous ENV variables have sensible defaults, the following are generally
 * expected to be available at time of execution:
 *
 * - `AWS_STAGE` (alternatively `NODE_ENV`), `AWS_ACCOUNT`, `AWS_REGION`,
 * - the "app name" will be set with `APP_NAME` or `SERVICE_NAME`
 *
 * While that's a lot of ENV variables, many Serverless setups will already setup most of these
 * and if you use the build system from `aws-orchestrate` they will ALL be set.
 */
export function parsePartiallyQualifiedArn(partial: string, options: IPartialParseOptions = {}): IParsedArn {
  const { lookup, service, resource } = options;
  if (lookup && lookup[partial as keyof typeof lookup]) {
    return parseFullyQualifiedArn(lookup[partial as keyof typeof lookup]);
  }
  /**  used to build up our understanding */
  const arn: Partial<IParsedArn> = {};

  /** relevant ENV variables */
  const env = getArnComponentsFromEnv();
  if (env.stage && isAwsStage(env.stage)) {
    arn.stage = env.stage;
  }

  // partition will always fall back to "aws"
  arn.partition = env.partition || "aws";

  try {
    if (service || isArnService(env.service || "")) {
      arn.service = service || env.service;
    } else {
      const { service } = extractService(partial);
      arn.service = service;
    }
    arn.resource = resourceLookup(arn.service);
  } catch {
    arn.service = "lambda";
    arn.resource = "function";
  }

  if (isAwsStage(env.stage)) {
    arn.stage = env.stage;
  }
  if (!arn.stage) {
    const { stage } = extractStage(partial);
    arn.stage = stage ? stage : undefined;
  }

  if (!arn.stage) {
    throw new ServerlessError(500, missingMessage("stage", partial, "AWS_STAGE", env), "arn/missing-stage");
  }

  if (isAwsAccountId(env.account)) {
    arn.account = env.account;
  } else {
    try {
      const { account } = extractAccount(partial);
      arn.account = account;
    } catch (underlyingError) {
      const error = new ServerlessError(
        500,
        missingMessage("account", partial, "AWS_ACCOUNT", env),
        "arn/missing-account"
      );
      error.underlyingError = underlyingError;
    }
  }

  if (!arn.account) {
    throw new ServerlessError(500, missingMessage("account", partial, "AWS_ACCOUNT", env), "arn/missing-account");
  }

  // Resource
  const resLookup: Record<ArnService, ArnResource | undefined> = {
    lambda: "function",
    states: "stateMachine",
    dynamodb: "table",
    logs: "log-group",
    events: "event-bus",
    iam: "role",
    sns: undefined,
    sqs: undefined,
  };
  function findResource(service: ArnService) {
    return Object.keys(resLookup).includes(service) ? resLookup[service] : undefined;
  }

  arn.resource = resource || findResource(arn.service);

  const parts = partial.split(":");
  const tail = parts.slice(-1).pop() || "";

  const re = new RegExp(`(.*?)-${arn.stage}-(.*)`);
  const [_, appCandidate, fnCandidate] = re.test(tail)
    ? (tail.match(re) as [string, string, string])
    : [undefined, undefined, tail];

  if (env.appName && (env.appName || appCandidate)) {
    console.log(env.appName, appCandidate);
    arn.appName = env.appName || appCandidate;
  }

  switch (arn.resource as ArnResource) {
    case "function":
      (arn as IParsedFunctionArn).fn = fnCandidate;
      break;
    case "stateMachine":
      (arn as IParsedStepFunctionArn).stepFunction = fnCandidate;
      break;
    default:
      (arn as IParsedGlobal | IParsedRegional).rest = fnCandidate;
  }

  const globalServices = ["aim"];
  if (isAwsRegion(env.region)) {
    arn.region = env.region;
  } else {
    const { region } = extractRegion(partial);
    arn.region = region ? region : undefined;
  }

  if (!arn.region && !globalServices.includes(arn.service)) {
    throw new ServerlessError(500, missingMessage("region", partial, "AWS_ACCOUNT", env), "arn/missing-region");
  }

  const errMessage = `The attempt to build a full ARN from a partial ARN ["${partial}"] failed.\n\nNote: relevant ENV variables detected included:\n${JSON.stringify(
    env,
    null,
    2
  )}`;

  // if (arn.partition && arn.account && arn.service && arn.resource && arn.stage && arn.appName) {
  try {
    arn.arn = buildArn(arn as Omit<IParsedArn, "arn">);
    console.log(arn.arn);
  } catch (buildError) {
    buildError.message = errMessage;
    throw buildError;
  }

  return arn as IParsedArn;
}
