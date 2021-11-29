import { ChoiceItem, State, Choice } from "~/step-fn";

describe("Choice State", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining default choice condition should be able to be configured by fluent API", () => {
    const fetchProfileImgUrl = Choice((c) =>
      c.default((s) => s.task("fetchAvatarUrlFromGravatar"))
    );

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(0);
  });

  it("Defining default choice condition should be able to be configured by step function shorthand", () => {
    const gravatarChoiceItem = ChoiceItem((c) =>
      c.stringEquals("value", "$.type", (s) => s.task("fetchFromGravatar"))
    );

    const fetchAvatarUrlFromGravatar = State((s) => s.task("fetchAvatarUrlFromGravatar"));
    const defaultChoiceItem = ChoiceItem((c) => c.default([fetchAvatarUrlFromGravatar]));

    const fetchProfileImgUrl = Choice(gravatarChoiceItem, defaultChoiceItem);

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(1);
  });

  it("Defining choice conditions should be able to be configured by fluent API", () => {
    const fetchProfileImgUrl = Choice((c1) =>
      c1
        .stringEquals("gravatar", "$.type", (stepFn) => stepFn.task("fetchFromGravatar"))
        .stringEquals("unavatar", "$.type", (stepFn) => stepFn.task("fetchFromUnavatar"))
    );

    expect(fetchProfileImgUrl.default).toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(2);
  });

  it("Defining choice conditions should be able to be configured by step function shorthand", () => {
    const fetchFromGravatar = State((s) => s.task("fetchAvatarUrlFromGravatar"));
    const saveIntoDb = State((s) => s.task("SaveIntoDb"));
    const defaultChoice = ChoiceItem((c) => c.default([fetchFromGravatar, saveIntoDb]));

    const fetchFromUnavatar = State((s) => s.task("fetchFromUnavatar"));
    const unavatarChoice = ChoiceItem((c) =>
      c.stringEquals("unavatar", "$.type", [fetchFromUnavatar, { namePrefix: "unavatar-" }])
    );

    const fetchProfileImgUrl = Choice(defaultChoice, unavatarChoice);

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(1);
  });
});
