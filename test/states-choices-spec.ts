import { condition, defaultChoice, State } from "~/step-fn";
import { IStepFnOptions } from "~/types";

describe("Choice State", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining default choice condition should be able to be configured by fluent API", () => {
    const fetchGravatar = defaultChoice((s) => s.task("fetchAvatarUrlFromGravatar"));

    const fetchProfileImgUrl = State((s) => s.choice([fetchGravatar]));

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(0);
  });

  it("Defining default choice condition should be able to be configured by step function shorthand", () => {
    const fetchAvatarUrlFromGravatar = State((s) => s.task("fetchAvatarUrlFromGravatar"));

    const defaultChoiceOption = defaultChoice([fetchAvatarUrlFromGravatar]);

    const fetchProfileImgUrl = State((s) => s.choice([defaultChoiceOption]));

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(0);
  });

  it("Defining choice conditions should be able to be configured by fluent API", () => {
    const fetchProfileImgUrl = State((s) =>
      s.choice([
        {
          variable: "$.type",
          stringEquals: "gravatar",
          stepFn: (s) => s.task("fetchFromGravatar"),
        },
        {
          variable: "$.type",
          stringEquals: "unavatar",
          stepFn: (s) => s.task("fetchFromUnavatar"),
        },
      ])
    );

    expect(fetchProfileImgUrl.default).toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(2);
  });

  it("Defining choice conditions should be able to be configured by step function shorthand", () => {
    const fetchFromGravatar = State((s) => s.task("fetchAvatarUrlFromGravatar"));
    const saveIntoDb = State((s) => s.task("SaveIntoDb"));
    const defaultOpts: IStepFnOptions = { namePrefix: "default-" };
    const defaultChoiceOption = defaultChoice([fetchFromGravatar, saveIntoDb, defaultOpts]);

    const fetchFromUnavatar = State((s) => s.task("fetchFromUnavatar"));
    const unavatarOpts: IStepFnOptions = { namePrefix: "unavatar-" };
    const unavatarChoice = condition(
      (c) => c.stringEquals("unavatar", "$.type"),
      [fetchFromUnavatar, unavatarOpts]
    );

    const fetchProfileImgUrl = State((s) => s.choice([defaultChoiceOption, unavatarChoice]));

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(1);
  });
});
