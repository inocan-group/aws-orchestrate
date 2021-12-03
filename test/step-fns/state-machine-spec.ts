import { IStepFunctionTask } from "common-types";
import { ChoiceItem, State, StateMachine, StepFunction } from "~/step-fn";
import { IStepFnOptions } from "~/types";

describe("State Machine", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Next sequence should be the same as array items index and the first should be marked as StartAt", () => {
    const firstTask = State((s) => s.task("firstTask"));
    const secondTask = State((s) => s.task("secondTask"));
    const thirdTask = State((s) => s.task("thirdTask"));

    const myStepFn = StepFunction(firstTask, secondTask, thirdTask);
    const awesomeStateMachine = StateMachine((s) =>
      s
        .stepFunction(myStepFn)
        .name("foo")
        .loggingConfig({ destinations: ["foo"] })
    ).value;

    const firstSequence = "firstTask";
    const secondSequence = (
      awesomeStateMachine.definition.States[firstSequence] as IStepFunctionTask
    ).Next!;
    const thirdSequence = (
      awesomeStateMachine.definition.States[secondSequence] as IStepFunctionTask
    ).Next!;

    expect(awesomeStateMachine.name).toEqual("abcapp-dev-foo");
    expect(awesomeStateMachine.loggingConfig).toEqual({
      destinations: ["arn:aws:logs:us-east-1:1234:log-group:abcapp-dev-state-machine-foo:*"],
    });
    expect(awesomeStateMachine.definition.StartAt).toEqual(firstSequence);
    expect(secondSequence).toEqual("secondTask");
    expect(thirdSequence).toEqual("thirdTask");
  });

  it("Defining state machine should only allow finalized state be used once", () => {
    const finalizedState = State((s) => s.task("foo1", { name: "finalizedState" }));

    const action = () =>
      StateMachine((s) =>
        s.name("fooStateMachine").stepFunction(StepFunction(finalizedState, finalizedState))
      ).value;

    expect(action).toThrowError({
      name: "ServerlessError",
      message: "Finalized state must only be used once",
    });
  });

  it("Defining state machine should show all choice conditions states in root definition ", () => {
    const fetchFromGravatar = State((s) => s.task("fetchAvatarUrlFromGravatar"));
    const saveIntoDb = State((s) => s.task("SaveIntoDb"));
    const defaultOpts: IStepFnOptions = { namePrefix: "default-" };
    const defaultChoiceOption = ChoiceItem((c) =>
      c.default([fetchFromGravatar, saveIntoDb, defaultOpts])
    );

    const fetchFromUnavatar = State((s) => s.task("fetchFromUnavatar"));
    const unavatarOpts: IStepFnOptions = { namePrefix: "unavatar-" };
    const unavatarChoice = ChoiceItem((c) =>
      c.stringEquals("unavatar", "$.type", [fetchFromUnavatar, unavatarOpts])
    );

    const fetchProfileImgUrl = State((s) =>
      s.choice(defaultChoiceOption, unavatarChoice, { name: "fooChoiceState" })
    );

    const stepFn = StepFunction(fetchProfileImgUrl);
    const stateMachine = StateMachine((s) => s.name("fooStateMachine").stepFunction(stepFn)).value;

    const stateNames = Object.keys(stateMachine.definition.States);

    expect(stateMachine.definition.StartAt).toEqual(fetchProfileImgUrl.name);
    expect(stateNames).toIncludeAllMembers(["unavatar-fetchFromUnavatar", "fooChoiceState"]);
  });
  it("Defining state machine should only allow finalized step function be used once", () => {});
});
