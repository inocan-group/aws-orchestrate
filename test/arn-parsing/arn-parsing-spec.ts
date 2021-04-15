import { parseFullyQualifiedArn } from "~/shared/parse";
import { IamArns, LambdaFunctionArns, StateMachineArns } from "../data/index";

describe("Parsing full ARNs:", () => {
  // IAM
  for (const i of IamArns) {
    const parsed = parseFullyQualifiedArn(i.arn);
    it(`IAM Arn: ${i.name}`, () => {
      expect(parsed.arn).toBe(i.arn);
      console.log({ parsed });
      for (const key of Object.keys(i.expected)) {
        expect(parsed[key as keyof typeof parsed]).toBe(i.expected[key]);
      }
    });
  }

  // Lambda Functions
  for (const i of LambdaFunctionArns) {
    const parsed = parseFullyQualifiedArn(i.arn);
    it(`Lambda Functions: ${i.name}`, () => {
      expect(parsed.arn).toBe(i.arn);
      for (const key of Object.keys(i.expected)) {
        expect(parsed[key as keyof typeof parsed]).toBe(i.expected[key]);
      }
    });
  }

  // Step Functions
  for (const i of StateMachineArns) {
    const parsed = parseFullyQualifiedArn(i.arn);
    it(`Step Functions: ${i.name}`, () => {
      expect(parsed.arn).toBe(i.arn);
      for (const key of Object.keys(i.expected)) {
        expect(parsed[key as keyof typeof parsed]).toBe(i.expected[key]);
      }
    });
  }
});
