import { ArnService, ArnResource, AwsRegion, AwsAccountId, ArnPartition, AwsStage } from "common-types";

import { parsePartiallyQualifiedArn } from "~/shared/parse";
import { IParsedArn, IServerlessError } from "~/types";
import { DEFAULT_ACCOUNT } from "../data/index";
import { right, catchErr, itif, isRight, left, isLeft } from "../helpers";

const APP1 = "teepee-services";
const APP2 = "wedoit";
const FN = "justDoIt";

/**
 * Allows overriding values with both valid and invalid strings
 */
interface IDefaultValues {
  partition?: ArnPartition | string;
  service?: ArnService | string;
  resource?: ArnResource | string;
  region?: AwsRegion | string;
  account?: AwsAccountId | string;
  stage?: AwsStage | string;
  appName?: string;
}

function setAllEnvs(exceptions: string[] = [], overrides: IDefaultValues = {}) {
  if (!exceptions.includes("partition") || overrides.partition) {
    process.env.AWS_PARTITION = "aws";
  }
  if (!exceptions.includes("service") || overrides.service) {
    process.env.AWS_DEFAULT_SERVICE = "lambda";
  }
  // if (!exceptions.includes("resource")|| overrides.resource) {
  //   process.env.AWS_DEFAULT_RESOURCE = "function";
  // }
  if (!exceptions.includes("region") || overrides.region) {
    process.env.AWS_REGION = overrides.region || "us-east-1";
  }
  if (!exceptions.includes("account") || overrides.account) {
    process.env.AWS_ACCOUNT = overrides.account || DEFAULT_ACCOUNT;
  }
  if (!exceptions.includes("stage") || overrides.stage) {
    process.env.AWS_STAGE = overrides.stage || "dev";
  }
  if (!exceptions.includes("appName") || overrides.appName) {
    process.env.APP_NAME = overrides.appName || APP1;
  }
}
function clearAllEnvs() {
  process.env = {};
}

interface IOptional {
  partition?: string;
  service?: string;
  resource?: string;
  stage?: string;
  region?: string;
  account?: string;
  appName?: string;
}

/**
 * Given a `fn` and the expected ARN, runs tests of partial completion
 */
const TEST = (partial: string, expection: string, exceptions: string[] = [], overrides: IOptional = {}) => {
  setAllEnvs(exceptions, overrides);

  const overrideMsg =
    Object.keys(overrides).length === 0
      ? ""
      : `with the properties: ${Object.keys(overrides)
          .map((i) => `${i}="${overrides[i as keyof typeof overrides]}"`)
          .join(", ")}`;

  const result = catchErr<IParsedArn, IServerlessError>(() => parsePartiallyQualifiedArn(partial));

  it(`"${partial}" ${overrideMsg} can be parsed`, () => {
    if (isLeft(result)) {
      console.log(left(result).toString());
    }
    expect(isRight(result)).toBe(true);
  });

  itif(isRight(result))(`"${partial}" is correctly transformed to "${expection}"`, () => {
    if (isRight(result)) {
      expect(right(result).arn).toBe(expection);
    }
  });
};

describe("Parsing partial ARNs w/ just service/stage/fn:", () => {
  clearAllEnvs();

  describe("with all ENV variables set", () => {
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-dev-${FN}`, [], {
      appName: APP1,
      stage: "dev",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP2}-prod-${FN}`, [], {
      appName: APP2,
      stage: "prod",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-sb_ken-${FN}`, [], {
      appName: APP1,
      stage: "sb_ken",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-feature_foo-bar-${FN}`, [], {
      appName: APP1,
      stage: "feature_foo-bar",
    });
  });

  describe("without ARN Partition ENV set", () => {
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-dev-${FN}`, ["partition"], {
      appName: APP1,
      stage: "dev",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-prod-${FN}`, ["partition"], {
      appName: APP1,
      stage: "prod",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-sb_ken-${FN}`, ["partition"], {
      appName: APP1,
      stage: "sb_ken",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-feature_foo-bar-${FN}`, ["partition"], {
      appName: APP1,
      stage: "feature_foo-bar",
    });
  });
});
