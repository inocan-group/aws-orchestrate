import { condition, State, StepFunction } from "~/step-fn";
import { IParallelOptions } from "~/types";

describe("Step Function", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "fooregion";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining step function should be configured by step function shorthand", () => {
    const task1 = State(s => s.task("helloWorld", { name: "foo2042" }));
    const task2 = State(s => s.task("helloWorld", { name: "foo2042" }));
    const task3 = State(s => s.task("helloWorld", { name: "foo2042" }));

    const stepFn = StepFunction(task1, task2, task3);

    expect(stepFn.state).toHaveLength(3);
  });

  it("`task`, `map`, `pass`, `wait`, `parallel` states in step function should not be finalized", () => {
    const nonTerminalStepFns = [
      StepFunction().task("foo"),
      StepFunction()
        .map("$.foo")
        .use(s => s.task("foo2")),
      StepFunction().pass(),
      StepFunction().wait(),
      StepFunction().parallel([]),
    ];

    expect(nonTerminalStepFns.every(r => !("getState" in r) && !("getOptions" in r))).toBeTrue();
  });

  it("`succeed`, `fail`, `choice` terminal states should finalize the step function", () => {
    const terminalStepFns = [
      StepFunction().succeed("succeddNoREason"),
      StepFunction().fail("no reason"),
      StepFunction().choice([]),
    ];

    expect(terminalStepFns.every(r => "getState" in r && "getOptions" in r)).toBeTrue();
  });

  it("Extending step function definition by fluent API on already finalized step function should throw error", () => {
    const terminalState = State(s => s.succeed());
    const action = () => StepFunction(terminalState).succeed();

    expect(action).toThrowError({
      name: "ServerlessError",
      message: "Not allowed to extend already finalized step function",
    });
  });

  it("Extending step function definition by shorthand on already finalized step function should throw error", () => {
    const terminalState = State(s => s.succeed());
    const notAllowedState = State(s => s.task("awesomeTask"));
    const action = () => StepFunction(terminalState, notAllowedState);

    expect(action).toThrowError({
      name: "ServerlessError",
      message: "Not allowed to extend already finalized step function",
    });
  });

  it("Defining a choice should return all its condition states in the step function `states` property", () => {
    const saveBasicInfo = State(s => s.task("saveBasicInfo"));

    const fetchFromGravatar = State(s => s.task("fetchAvatarUrlFromGravatar"));
    const saveIntoDb = State(s => s.task("SaveIntoDb"));
    const defaultChoice = condition(c => c.default(), [fetchFromGravatar, saveIntoDb]);

    const fetchFromUnavatar = State(s => s.task("fetchFromUnavatar"));
    const unavatarChoice = condition(c => c.stringEquals("unavatar"), [fetchFromUnavatar], "$.type");

    const myAwesomeStepFunction = StepFunction(saveBasicInfo).choice([defaultChoice, unavatarChoice]);

    console.log(myAwesomeStepFunction.getState());

    expect(myAwesomeStepFunction.getState()).toHaveLength(2);
  });

  it("Defining map should return a state which has its own step function definition", () => {
    const getUserInfo = State(s => s.task("getUserInfo"));

    const emailNotification = State(s => s.task("emailNotification"));
    const persistNotificationResults = State(s => s.task("persistNotificationResults"));

    const stepFnOptions = { namePrefix: "map-" };
    const notifyAllUsers = StepFunction(getUserInfo)
      .map("$.users", { name: "notifyAllUsers" })
      .use([emailNotification, persistNotificationResults, stepFnOptions])
      .succeed();

    expect(notifyAllUsers.getState()).toHaveLength(3);
  });

  it("Defining parallel should return a single state which has parallel and they have their own states", () => {
    const parallelOptions: IParallelOptions = { comment: "foo" };

    const stepFnOptions = { namePrefix: "email-" };
    const customerEmailNotification = State(s => s.task("customerEmailNotification"));
    const employeeEmailNotification = State(s => s.task("employeeEmailNotification"));
    const branch1 = [customerEmailNotification, employeeEmailNotification, stepFnOptions];

    const smsNotification = State(s => s.task("smsNotification"));
    const branch2 = [smsNotification];

    const myAwesomeStepFn = StepFunction().parallel([branch1, branch2], parallelOptions);
    const [resultState] = myAwesomeStepFn.state;

    expect(myAwesomeStepFn.state).toHaveLength(1);
    expect(resultState.isTerminalState).toBeFalse();
    expect(resultState.type).toEqual("Parallel");
  });

  it("Using finalized Step Function should throw error", () => {});
});
