import { AwsResource } from "common-types";
import { isServerlessError, ServerlessError } from "~/errors";
import {
  extractPartition,
  extractAccount,
  extractRegion,
  extractResource,
  extractStage,
  extractService,
} from "~/shared/parse";
import { StateMachineArns, DEFAULT_ACCOUNT, IamArns } from "../data";

describe("extractPartition()", () => {
  it("extractPartition able to extract with aws partition", () => {
    const arn = "arn:aws:iam::888955399055:role/teepee-services-dev-TeepeeDashservicesDashke-9RYW4W0C9X16";
    const extracted = extractPartition(arn);
    expect(extracted.partition).toBe("aws");
  });

  it("extractPartition able to extract with aws-cn partition", () => {
    const arn = "arn:aws-cn:iam::888955399055:role/teepee-services-dev-TeepeeDashservicesDashke-9RYW4W0C9X16";
    const extracted = extractPartition(arn);
    expect(extracted.partition).toBe("aws-cn");
  });

  it("extractPartition able to extract with aws-us-gov partition", () => {
    const arn = "arn:aws-us-gov:iam::888955399055:role/teepee-services-dev-TeepeeDashservicesDashke-9RYW4W0C9X16";
    const extracted = extractPartition(arn);
    expect(extracted.partition).toBe("aws-us-gov");
  });

  it("extractPartition fails with invalid partition name", () => {
    const arn = "arn:aws-uk:iam::888955399055:role/teepee-services-dev-TeepeeDashservicesDashke-9RYW4W0C9X16";
    try {
      extractPartition(arn);
      throw new Error("extraction should have thrown error");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
      if (isServerlessError(error)) {
        expect(error.classification).toInclude("arn");
        expect(error.code).toBe("missing-partition");
        expect(error.httpStatus).toBe(500);
      } else {
        throw new Error("ServerlessError not picked up by type guard");
      }
    }
  });
});

describe("extractAccount()", () => {
  it("a valid account ID in a regional ARN is found", () => {
    const extracted = extractAccount(StateMachineArns[0].arn);
    expect(extracted.account).toBe(DEFAULT_ACCOUNT);
  });

  it("a valid account ID in a global ARN is found", () => {
    const extracted = extractAccount(IamArns[0].arn);
    expect(extracted.account).toBe(DEFAULT_ACCOUNT);
  });

  it("invalid string character in account throws error", () => {
    const arn = StateMachineArns[0].arn.replace(DEFAULT_ACCOUNT, "234234abc34");
    try {
      extractAccount(arn);
      throw new Error("invalid account should have thrown error");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
      expect(error.code).toBe("missing-account");
      expect(error.httpStatus).toBe(500);
    }
  });
});

describe("extractRegion()", () => {
  it("a valid regional ARN returns correct region", () => {
    const arn = StateMachineArns[0].arn;
    const extracted = extractRegion(arn);
    expect(extracted.region).toBe(StateMachineArns[0].expected.region);
  });

  it("an invalid regional ARN throws an error", () => {
    const arn = StateMachineArns[0].arn.replace("us-east-1", "us-fake-0");
    try {
      extractRegion(arn);
      throw new Error("extraction should have produced error");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
      expect(error.code).toBe("invalid-region");
    }
  });

  it("a valid global ARN returns 'false' for region", () => {
    const arn = IamArns[0].arn;
    const extracted = extractRegion(arn);
    expect(extracted.region).toBe(false);
  });
});

describe("extractResource()", () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const arnGen = (resource: string) => `aws:lambda:2342141234:us-east-1:${resource}:the rest`;
  it("a valid resource is correctly detected", () => {
    const e1 = extractResource(arnGen("function"));
    const e2 = extractResource(arnGen("stateMachine"));
    const e3 = extractResource(arnGen("role"));
    expect(e1.resource).toBe("function");
    expect(e2.resource).toBe("stateMachine");
    expect(e3.resource).toBe("role");
  });

  it("an invalid resource throws an error", () => {
    try {
      const e1 = extractResource(arnGen("foobar"));
      expect(e1.resource).toBe("function");
      throw new Error("invalid resource should have thrown error");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
    }
  });
});

describe("extractStage()", () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const arnGen = (resource: AwsResource, stage: string) =>
    `aws:lambda:2342141234:us-east-1:${resource}:service-name-${stage}-rest`;

  it("function with 'dev' stage extracted", () => {
    const extracted = extractStage(arnGen("function", "dev"));
    expect(extracted.stage).toBe("dev");
  });

  it("function with 'sb-bob' sandbox stage extracted", () => {
    const extracted = extractStage(arnGen("function", "sb-bob"));
    expect(extracted.stage).toBe("sb-bob");
  });

  it("function with invalid stage name throws error due to 'missing' stage name", () => {
    console.log(arnGen("function", "invalid"));

    try {
      expect(extractStage(arnGen("function", "invalid"))).toThrow("Error");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
      expect(error.code).toBe("missing-stage");
    }
  });

  it("IAM role with invalid stage name throws returns false instead of error", () => {
    const extracted = extractStage(arnGen("role", "invalid"));
    expect(extracted.stage).toBe(false);
  });

  it("IAM role with valid stage name is correctly extracted", () => {
    const extracted = extractStage(arnGen("role", "dev"));
    expect(extracted.stage).toBe("dev");
  });
});

describe("extractService()", () => {
  const arnGen = (service: string) => `aws:${service}:2342141234:us-east-1:function:the rest`;

  it("valid service name is extracted", () => {
    const extracted = extractService(arnGen("lambda"));
    expect(extracted.service).toBe("lambda");
  });
  it("invalid service name throws an error", () => {
    try {
      extractService(arnGen("popcorn"));
    } catch (error) {
      expect(error).toBeInstanceOf(ServerlessError);
    }
  });
});
