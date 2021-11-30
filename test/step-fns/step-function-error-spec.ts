import { IStepFunctionStep, IStepFunctionTask } from "common-types";
import { State } from "~/step-fn/entities/state";
import { StateMachine } from "~/step-fn/entities/stateMachine";
import { StepFunction } from "~/step-fn/entities/stepFunction";
import { Catch, Retry } from "~/step-fn/error-handler";
import { RetryOptions } from "~/types/step-fns/errorHandler";

describe("Step Function Builder Error Handler", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining error step function should start with first state finalized", () => {
    const waitState = State((s) => s.wait({ timestamp: "asd" }));
    const catchConfig = Catch((e) => e.allErrors([waitState]));
    const fooStepFn = StepFunction({
      catch: catchConfig,
    }).task("task1");

    const action = () => StateMachine((s) => s.name("foo").stepFunction(fooStepFn)).toJSON();

    expect(action).toThrowError({
      name: "ServerlessError",
      message: "The first state must be finalized",
    });
  });

  it("Defining error step function should start with first state finalized unless state is being defined by fluentAPI", () => {
    const catchConfig = Catch((e) => e.allErrors((sf) => sf.task("foo")));
    const fooStepFn = StepFunction({
      catch: catchConfig,
    }).task("task1");

    const action = () => StateMachine((s) => s.name("foo").stepFunction(fooStepFn)).toJSON();

    expect(action).not.toThrowError();
  });

  it("Defining error handler as state machine options should be populated in all children states", () => {
    const finalizedStepFn = StepFunction()
      .task("handler2", { name: "foo1" })
      .task("handler3", { name: "foo2" })
      .succeed("foo3");
    const fooStepFn = StepFunction().task("task1");

    const stateMachine = StateMachine((s) =>
      s
        .name("fooStateMachine")
        .stepFunction(fooStepFn)
        .catch((c) => c.allErrors(finalizedStepFn, "$.foo"))
    ).toJSON();

    const resultStates = Object.values(stateMachine.definition.States);

    expect(
      resultStates
        .filter((r) => r.Type === "Task" && r.Catch !== undefined)
        .every((r: IStepFunctionStep) => {
          return "Catch" in r
            ? () => {
                const [defaultHandler] = r.Catch || [];
                return defaultHandler.Next === "foo1";
              }
            : false;
        })
    ).toBeTrue();
  });

  it("Defining error handler as step function options should be populated in all children states", () => {
    const finalizedStepFn = StepFunction()
      .task("handler2", { name: "foo1" })
      .task("handler3", { name: "foo2" })
      .succeed("foo3");

    const fooStepFn = StepFunction((s) => s.catch((c) => c.allErrors(finalizedStepFn))).task(
      "task1"
    );

    const stateMachine = StateMachine((s) =>
      s.name("fooStateMachine").stepFunction(fooStepFn)
    ).toJSON();

    const resultStates = Object.values(stateMachine.definition.States);

    expect(
      resultStates
        .filter((r) => r.Type === "Task" && r.Catch !== undefined)
        .every((r: IStepFunctionStep) => {
          return "Catch" in r
            ? () => {
                const [defaultHandler] = r.Catch || [];
                return defaultHandler.Next === "foo1";
              }
            : false;
        })
    ).toBeTrue();
  });

  it("Defining state `catch` error handler should overwrite error handlers defined in step function and state machineWrapper", () => {
    const finalizedStepFn = StepFunction()
      .task("handler2", { name: "foo1" })
      .task("handler3", { name: "foo2" })
      .succeed("handler4");

    const finalizedStepFn2 = StepFunction()
      .task("handler5", { name: "handler5" })
      .task("handler6", { name: "handler6" })
      .finalize();

    const fooStepFn = StepFunction({
      catch: Catch((c) => c.allErrors(finalizedStepFn)),
    }).task("task1", {
      catch: Catch((c) => c.allErrors(finalizedStepFn2)),
    });

    const stateMachine = StateMachine((s) =>
      s.name("fooStateMachine").stepFunction(fooStepFn)
    ).toJSON();

    const resultStates = Object.values(stateMachine.definition.States);

    expect(
      resultStates
        .filter((r) => r.Type === "Task" && r.Catch !== undefined)
        .every((r) => {
          const task = r as unknown as IStepFunctionTask;
          const [defaultHandler] = task.Catch || [];
          return defaultHandler.Next !== "foo1";
        })
    ).toBeTrue();
  });

  it("Defining state `retry` error handler should be populated to the output state definition", () => {
    const retryOptions: RetryOptions = { maxAttempts: 5 };
    const fooTask = State((s) =>
      s.task("fooTask", { retry: Retry((api) => api.allErrors(retryOptions)) })
    );

    const myStateMachine = StateMachine((s) =>
      s.name("fooStateMachine").stepFunction(StepFunction(fooTask))
    ).toJSON();

    expect(
      (myStateMachine.definition.States["fooTask"] as IStepFunctionTask).Retry![0].MaxAttempts
    ).toBe(retryOptions.maxAttempts);
  });
});
