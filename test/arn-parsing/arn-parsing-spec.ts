import { ServerlessError } from "~/errors";
import { parseFullyQualifiedArn } from "~/shared/parse";
import { IParsedArn } from "~/types";
import { IamArns, LambdaFunctionArns, StateMachineArns } from "../data/index";
import { right, catchErr, itif, isRight, left } from "../helpers";

describe("Parsing full ARNs:", () => {
  // IAM
  describe("IAM", () => {
    for (const i of IamArns) {
      const result = catchErr<IParsedArn, ServerlessError>(() => parseFullyQualifiedArn(i.arn));
      it(`${i.name} is able to be parsed`, () => {
        if (!isRight(result)) {
          console.log("Failed parsing with error:", left(result));
        }
        expect(isRight(result)).toBe(true);
      });
      const parsed: IParsedArn | undefined = right(result);

      itif(isRight(result))(`${i.name} has all expected values matched`, () => {
        if (parsed) {
          expect(parsed.arn).toBe(i.arn);
          for (const key of Object.keys(i.expected)) {
            if (parsed[key as keyof typeof parsed] !== i.expected[key]) {
              console.log(`"${key}" comparison failed. Expected "${i.expected[key]}".`, [
                parsed[key as keyof typeof parsed],
                i.expected[key],
              ]);
              console.log("Overall parsed response was:", parsed);
            }

            expect(parsed[key as keyof typeof parsed]).toBe(i.expected[key]);
          }
        } else {
          // this should never be reached as the conditional operator should ensure this
          // just wrapping to avoid typescript errors
        }
      });
    }
  });

  // Lambda Functions
  describe("Lambda", () => {
    for (const i of LambdaFunctionArns) {
      const result = catchErr<IParsedArn, ServerlessError>(() => parseFullyQualifiedArn(i.arn));
      it(`Lambda ${i.name} can be parsed`, () => {
        expect(isRight(result)).toBe(true);
      });

      itif(isRight(result))(`Lambda Functions: ${i.name}`, () => {
        // always true; used for type gaurd's benefit
        if (isRight(result)) {
          const actual = right(result);
          expect(actual.arn).toBe(i.arn);
          for (const key of Object.keys(i.expected)) {
            expect(actual[key as keyof typeof actual]).toBe(i.expected[key]);
          }
        }
      });
    }
  });

  // Step Functions
  describe("Step Functions", () => {
    for (const i of StateMachineArns) {
      const result = catchErr<IParsedArn, ServerlessError>(() => parseFullyQualifiedArn(i.arn));
      it(`Step Fn ${i.name} can be parsed`, () => {
        expect(isRight(result)).toBe(true);
      });
      itif(isRight(result))(`Step Fn ${i.name} has all expected props`, () => {
        if (isRight(result)) {
          const parsed = right(result);
          expect(parsed.arn).toBe(i.arn);
          for (const key of Object.keys(i.expected)) {
            expect(parsed[key as keyof typeof parsed]).toBe(i.expected[key]);
          }
        }
      });
    }
  });
});
