import { State, StepFunction } from "~/step-fn";
import { Finalized, IState, IStateConfiguring } from "~/types";
import { Expect, ExpectExtends } from "@type-challenges/utils";

const setEnvironmentVariables = () => {
  process.env.AWS_REGION = "us-east-1";
  process.env.AWS_STAGE = "dev";
  process.env.AWS_ACCOUNT = "1234";
  process.env.APP_NAME = "AbcApp";
};

describe("States", () => {
  it("Defining states with name should return `Finalized<IState>`", () => {
    setEnvironmentVariables();

    const sf1 = StepFunction({
      type: "Task",
      resource: "fooMapTask",
      isFinalized: false,
      isTerminalState: false,
    });
    const stateDefinitions: ((api: IStateConfiguring) => Finalized<IState>)[] = [
      (s) => s.task("foo", { name: "fooTask" }),
      (s) => s.wait({ name: "fooWait" }),
      (s) => s.pass({ name: "fooPass" }),
      (s) => s.succeed("fooSucceed"),
      (s) => s.fail("unknown reason", { name: "fooFail" }),
      (s) => s.map((m) => m.itemsPath("$.foo").stepFunction(sf1).name("fooMap")),
      (s) => s.choice((c) => c.default([]), { name: "fooChoice" }),
      (s) =>
        s.parallel((p) => p.addBranch((s1) => s1.task("task1")), {
          comment: "foo",
          name: "fooParallel",
        }),
    ];

    const result = stateDefinitions.map((s) => State(s));

    // @ts-ignore
    type cases = [Expect<ExpectExtends<Finalized<IState>[], typeof result>>];

    // Flag should be true
    expect(result.every((r) => r.isFinalized)).toBeTrue();
    // name property exists in the state object and it's not null
    expect(result.every((r) => r.isFinalized && "name" in r && r.name !== null)).toBeTrue();
  });

  it("Defining states without name should return unfinalized `IState`", () => {
    setEnvironmentVariables();

    const stateDefinitions: ((api: IStateConfiguring) => IState)[] = [
      (s) => s.task("foo"),
      (s) => s.wait(),
      (s) => s.pass(),
      (s) => s.succeed(),
      (s) => s.fail("unknown reason"),
      (s) =>
        s.map((m) =>
          m.itemsPath("$.foo").stepFunction(
            StepFunction({
              type: "Task",
              resource: "fooMapTask",
              isFinalized: false,
              isTerminalState: false,
            })
          )
        ),
      (s) => s.choice((c) => c.default([])),
      (s) => s.parallel([]),
    ];

    const result = stateDefinitions.map((s) => State(s));

    // @ts-ignore
    type cases = [Expect<ExpectExtends<IState[], typeof result>>];

    // Flag should be false
    expect(result.every((r) => r.isFinalized)).toBeFalse();
    // name property should not exist in the state object
    expect(result.every((r) => !r.isFinalized && !("name" in r))).toBeTrue();
  });
});

describe("Task State", () => {
  it("Defining resource with function name should be translated to proper ARN if ENV variables are configured", () => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";

    const fnName = "fooSendEmail";
    const sendEmail = State((s) => s.task(fnName));

    expect(sendEmail.type).toEqual("Task");
    expect(sendEmail.isTerminalState).toEqual(false);
    expect(sendEmail.resource).toEqual(
      `arn:aws:lambda:us-east-1:1234:function:abcapp-dev-${fnName}`
    );
  });
});
