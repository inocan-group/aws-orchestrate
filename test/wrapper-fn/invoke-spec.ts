import { parseArn, buildInvocationRequest } from "~/invoke";
import { ensureFunctionName } from "~/shared";
import { getStage } from "aws-log";

describe("ensureFunctionName() →", () => {
  it("name starting with invalid character fails", () => {
    try {
      ensureFunctionName("-abc");
      throw new Error("should not have gotten here");
    } catch (error) {
      expect(error.name).toEqual("InvalidName");
    }

    try {
      ensureFunctionName("1abc");
      throw new Error("should not have gotten here");
    } catch (error) {
      expect(error.name).toEqual("InvalidName");
    }

    try {
      ensureFunctionName("?abc");
      throw new Error("should not have gotten here");
    } catch (error) {
      expect(error.name).toEqual("InvalidName");
    }
  });

  it("name special characters in it fails", () => {
    try {
      ensureFunctionName("abc*");
      throw new Error("should not have gotten here");
    } catch (error) {
      expect(error.name).toEqual("InvalidName");
    }
    try {
      ensureFunctionName("abc&");
      throw new Error("should not have gotten here");
    } catch (error) {
      expect(error.name).toEqual("InvalidName");
    }
    try {
      ensureFunctionName("abc,");
      throw new Error("should not have gotten here");
    } catch (error) {
      expect(error.name).toEqual("InvalidName");
    }
  });

  it("valid name passes", () => {
    const name = ensureFunctionName("abc");
    expect(name).toEqual("abc");
  });
});

describe("invoke :: ARN Parsing →", () => {
  it("fully qualified ARN is parsed", () => {
    const arn = "arn:aws:lambda:us-east-1:9378553667040:function:test-services-prod-sentinel";
    const results = parseArn(arn);
    expect(results.region).toEqual("us-east-1");
    expect(results.account).toEqual("9378553667040");
    expect(results.stage).toEqual("prod");
    expect(results.fn).toEqual("sentinel");
    expect(results.appName).toEqual("test-services");
  });

  it("short ARN with all ENV is parsed", () => {
    const arn = "sentinel";
    process.env.AWS_STAGE = "prod";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "test-services";
    const results = parseArn(arn);
    expect(results.stage).toEqual("prod");
    expect(results.account).toEqual("9378553667040");
    expect(results.region).toEqual("us-east-1");
    expect(results.appName).toEqual("test-services");
  });

  it("short ARN without AWS_STAGE still works because it uses getStage's default", () => {
    const arn = "sentinel";
    process.env.AWS_STAGE = "";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "test-services";
    try {
      const results = parseArn(arn);
      expect(results.stage).toEqual(getStage());
    } catch (error) {
      throw error;
    }
  });

  it("short ARN without AWS_NAME errors out", () => {
    const arn = "sentinel";
    process.env.AWS_STAGE = "prod";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "";
    try {
      parseArn(arn);
      throw new Error("should not have gotten here");
    } catch (error) {
      expect(error.message).toInclude("appName");
      expect(error.name).toEqual("ArnParsingError");
    }
  });
});

describe("invoke :: buildInvocationRequest() →", () => {
  it("request is correct structure with basic params sent in", async () => {
    process.env.AWS_STAGE = "prod";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "my-services";
    const response = buildInvocationRequest(parseArn("myFunc"), {
      foo: 1,
      bar: 2,
    });
    expect(response.Payload).toBe("string");
    const payload = JSON.parse(response.Payload as string);
    expect(payload.headers).toBe("object");
    expect(payload.headers).toHaveProperty("X-Correlation-Id");
    expect(payload.headers["x-calling-function"]);

    expect(response.FunctionName).toEqual(
      `arn:aws:lambda:us-east-1:9378553667040:function:${process.env.APP_NAME}-${process.env.AWS_STAGE}-myFunc`
    );

    expect(response.LogType).toEqual("None");
    expect(response.InvocationType).toEqual("Event");
  });
});
