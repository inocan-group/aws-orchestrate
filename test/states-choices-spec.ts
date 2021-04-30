import { ChoiceItem, State } from "~/step-fn";

describe("Choice State", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  // it("Defining default choice condition should be able to be configured by fluent API", () => {
  //   const fetchGravatar = defaultChoice((s) => s.task("fetchAvatarUrlFromGravatar"));

  //   const fetchProfileImgUrl = State((s) => s.choice(fetchGravatar));

  //   expect(fetchProfileImgUrl.default).not.toBeUndefined();
  //   expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
  //   expect(fetchProfileImgUrl.choices).toHaveLength(0);
  // });

  // TODO: add this type
  /**
   * My description
   *
   * ``ts
   * const foo = "bar";
   * ```
   */
  // export type Condition<T> = T | [T, IChoiceVariable];
  // const c: Condition<string> = ["foobar", "$.pathToFoobar"];
  // function stringEquals(...c: Condition, ...sf: StepFunction) {}

  it("Defining default choice condition should be able to be configured by step function shorthand", () => {
    const gravatarChoiceItem = ChoiceItem(
      (c) => c.stringEquals("value", "$.type", (s) => s.task("fetchFromGravatar"))
      // TODO: c.stringEquals("gravatar", "$.type", (s) => s.task("fetchFromGravatar", "$.type")
      // TODO: c.stringEquals("gravatar", "$.type", [state1, state2])
      // TODO: c.stringEquals("gravatar", "$.type", sf);
      // TODO: c.stringEquals("gravatar", [state1, state2])
      // TODO: c.stringEquals(c, [state1, state2])
    );

    const fetchAvatarUrlFromGravatar = State((s) => s.task("fetchAvatarUrlFromGravatar"));
    const defaultChoiceItem = ChoiceItem((c) => c.default([fetchAvatarUrlFromGravatar]));

    const fetchProfileImgUrl = State((s) => s.choice(gravatarChoiceItem, defaultChoiceItem));

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(1);
  });

  it("Defining choice conditions should be able to be configured by fluent API", () => {
    const fetchProfileImgUrl = State((s) =>
      s.choice((c1) =>
        c1
          .stringEquals("gravatar", "$.type", (stepFn) => stepFn.task("fetchFromGravatar"))
          .stringEquals("unavatar", "$.type", (stepFn) => stepFn.task("fetchFromUnavatar"))
      )
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
      c.stringEquals("unavatar", "$.type", [fetchFromUnavatar, { namePrefix: "unavatar-" }],)
    );

    const fetchProfileImgUrl = State((s) => s.choice(defaultChoice, unavatarChoice));

    expect(fetchProfileImgUrl.default).not.toBeUndefined();
    expect(fetchProfileImgUrl.isTerminalState).toBeTrue();
    expect(fetchProfileImgUrl.choices).toHaveLength(1);
  });
});
