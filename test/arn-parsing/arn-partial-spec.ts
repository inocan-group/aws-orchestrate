import { ArnService, ArnResource, AwsRegion, AwsAccountId, ArnPartition, AwsStage, TypeSubtype } from "common-types";

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
    process.env.AWS_PARTITION = overrides.partition || "aws";
  }
  if (!exceptions.includes("service") || overrides.service) {
    process.env.AWS_DEFAULT_SERVICE = overrides.service || "lambda";
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
const TEST = (partial: string, expectation: string, exceptions: string[] = [], overrides: IOptional = {}) => {
  clearAllEnvs();
  setAllEnvs(exceptions, overrides);

  const overrideMsg =
    Object.keys(overrides).length === 0
      ? ""
      : ` with ${Object.keys(overrides)
          .map((i) => `${i}="${overrides[i as keyof typeof overrides]}"`)
          .join(", ")}`;

  const result = catchErr<IParsedArn, IServerlessError>(() => parsePartiallyQualifiedArn(partial));

  it(`Able to parse ${overrideMsg}`, () => {
    if (isLeft(result)) {
      console.log(left(result).toString());
    }
    expect(isRight(result)).toBe(true);
  });

  itif(isRight(result))(`"${partial}" is transformed to "${expectation}"`, () => {
    if (isRight(result)) {
      expect(right(result).arn).toBe(expectation);
    }
  });
};

const NEG_TEST = (
  partial: string,
  reason: string,
  classification: TypeSubtype,
  exceptions: string[] = [],
  overrides: IOptional = {}
) => {
  clearAllEnvs();
  setAllEnvs(exceptions, overrides);

  const result = catchErr<IParsedArn, IServerlessError>(() => parsePartiallyQualifiedArn(partial));

  it(`Parsing${process.env.AWS_SERVICE ? ` ${process.env.AWS_SERVICE}` : ""} fails ${reason}`, () => {
    if (isRight(result)) {
      console.log("Was supposed to fail but didn't; result is below:\n", JSON.stringify(right(result), null, 2));
      console.log(`\nEnvironment variables were: ${JSON.stringify(process.env, null, 2)}`);
    }
    expect(isLeft(result)).toBe(true);
  });

  itif(isLeft(result))(`The error classification is "${classification}"`, () => {
    if (isLeft(result)) {
      expect(left(result).classification).toBe(classification);
    }
  });
};

describe("Partial ARN parsing", () => {
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

  describe("without AWS_PARTITION", () => {
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-dev-${FN}`, ["partition"], {
      appName: APP1,
      stage: "dev",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP2}-prod-${FN}`, ["partition"], {
      appName: APP2,
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

  describe("with AWS_PARTITION set to aws-us-gov", () => {
    TEST(FN, `arn:aws-us-gov:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-dev-${FN}`, [], {
      appName: APP1,
      stage: "dev",
      partition: "aws-us-gov",
    });
    TEST(FN, `arn:aws-us-gov:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP2}-prod-${FN}`, [], {
      appName: APP2,
      stage: "prod",
      partition: "aws-us-gov",
    });
    TEST(FN, `arn:aws-us-gov:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-sb_ken-${FN}`, [], {
      appName: APP1,
      stage: "sb_ken",
      partition: "aws-us-gov",
    });
    TEST(FN, `arn:aws-us-gov:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-feature_foo-bar-${FN}`, [], {
      appName: APP1,
      stage: "feature_foo-bar",
      partition: "aws-us-gov",
    });
  });

  describe("AWS_PARTITION and AWS_DEFAULT_SERVICE not set", () => {
    const exclude = ["partition", "service"];
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-dev-${FN}`, exclude, {
      appName: APP1,
      stage: "dev",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP2}-prod-${FN}`, exclude, {
      appName: APP2,
      stage: "prod",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-sb_ken-${FN}`, exclude, {
      appName: APP1,
      stage: "sb_ken",
    });
    TEST(FN, `arn:aws:lambda:us-east-1:${DEFAULT_ACCOUNT}:function:${APP1}-feature_foo-bar-${FN}`, exclude, {
      appName: APP1,
      stage: "feature_foo-bar",
    });
  });

  describe("Exotics", () => {
    //
  });

  describe("Edge Cases", () => {
    it("excluding AWS_REGION from a IAM conversion is fine because it's a global resource", () => {
      clearAllEnvs();
      setAllEnvs(["region"]);
      const parsed = parsePartiallyQualifiedArn("ken", {
        service: "iam",
        resource: "user",
      });
      expect(parsed.arn).toBe(`arn:aws:iam::${DEFAULT_ACCOUNT}:user/ken`);
    });
  });

  describe("Negative Tests", () => {
    NEG_TEST(FN, "because STAGE can not be found", "arn/missing-stage", ["stage"]);
    NEG_TEST(FN, "because ACCOUNT can not be found", "arn/missing-account", ["account"]);
    NEG_TEST(FN, "because REGION can not be found (and lambda is regional)", "arn/missing-region", ["region"]);
  });
});
