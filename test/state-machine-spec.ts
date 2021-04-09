import { IStepFunctionTask } from "common-types";
import { condition, State, StateMachine, StepFunction } from "~/step-fn";
import { IStepFnOptions } from "~/types";

describe("State Machine", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "fooregion";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Next sequence should be the same as array items index and the first should be marked as StartAt", () => {
    const firstTask = State((s) => s.task("firstTask"));
    const secondTask = State((s) => s.task("secondTask"));
    const thirdTask = State((s) => s.task("thirdTask"));

    const awesomeStateMachine = StateMachine("fooStateMachine", {
      stepFunction: StepFunction(firstTask, secondTask, thirdTask),
    }).toJSON();

    const firstSequence = "firstTask";
    const secondSequence = (awesomeStateMachine.definition.States[firstSequence] as IStepFunctionTask).Next!;
    const thirdSequence = (awesomeStateMachine.definition.States[secondSequence] as IStepFunctionTask).Next!;

    expect(awesomeStateMachine.definition.StartAt).toEqual(firstSequence);
    expect(secondSequence).toEqual("secondTask");
    expect(thirdSequence).toEqual("thirdTask");
  });
  it("`toYaml` should return yaml definition as string value", () => {
    const fooTask = State((s) => s.task("firstTask"));

    const yamlDefinition = StateMachine("fooStateMachine", {
      stepFunction: StepFunction(fooTask),
    }).toYaml();

    expect(typeof yamlDefinition).toEqual("string");
  });

  it("Defining state machine should only allow finalized state be used once", () => {
    const finalizedState = State((s) => s.task("foo1", { name: "finalizedState" }));

    const action = () =>
      StateMachine("fooStateMachine", { stepFunction: StepFunction(finalizedState, finalizedState) }).toJSON();

    expect(action).toThrowError({ name: "ServerlessError", message: "Finalized state must only be used once" });
  });

  it("Defining state machine should show all choice conditions states in root definition ", () => {
    const fetchFromGravatar = State((s) => s.task("fetchAvatarUrlFromGravatar"));
    const saveIntoDb = State((s) => s.task("SaveIntoDb"));
    const defaultOpts: IStepFnOptions = { namePrefix: "default-" };
    const defaultChoice = condition((c) => c.default(), [fetchFromGravatar, saveIntoDb, defaultOpts], "$.type");

    const fetchFromUnavatar = State((s) => s.task("fetchFromUnavatar"));
    const unavatarOpts: IStepFnOptions = { namePrefix: "unavatar-" };
    const unavatarChoice = condition((c) => c.stringEquals("unavatar"), [fetchFromUnavatar, unavatarOpts], "$.type");

    const fetchProfileImgUrl = State((s) => s.choice([defaultChoice, unavatarChoice], { name: "fooChoiceState" }));

    const stepFn = StepFunction(fetchProfileImgUrl);
    const stateMachine = StateMachine("fooStateMachine", { stepFunction: stepFn }).toJSON();

    const stateNames = Object.keys(stateMachine.definition.States);

    expect(stateMachine.definition.StartAt).toEqual(fetchProfileImgUrl.name);
    expect(stateNames).toIncludeAllMembers(["unavatar-fetchFromUnavatar", "fooChoiceState"]);
  });
  it("Defining state machine should only allow finalized step function be used once", () => {});
});
