import { State, StepFunction } from "~/step-fn";
import { IParallelOptions } from "~/types";

describe("Parallel State", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234 ";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining parallel should be able to configured by fluent API", () => {
    const opts = { comment: "foo" };
    /**
     * Composable Syntax: Each array of states represents a step function (a branch)
     */
    const branch1state1 = State((s) => s.task("foo1"));
    const branch1state2 = State((s) => s.task("foo1"));

    const branch2state1 = State((s) => s.task("foo1"));
    const branch2state2 = State((s) => s.task("foo1"));

    const notifyTasks1 = State((s) =>
      s.parallel([branch1state1, branch1state2], [branch2state1, branch2state2], opts)
    );

    /**
     * Composable Syntax: Accepts passing step function as branch in the leading params
     */
    const branch1StepFn = StepFunction(branch1state1, branch1state2);
    const branch2StepFn = StepFunction(branch2state1, branch2state2);

    const notifyTasks2 = State((s) => s.parallel(branch1StepFn, branch2StepFn, opts));

    /**
     * FluentAPI: You could define each branch/stepFn in fluent Api syntax separated by comma. 
     * Optionally, accepts tail param as options hash
     */
    const notifyTasks3 = State((s) =>
      s.parallel(
        (s1) => s1.task("branch1State1").task("branch1State2"),
        (s2) => s2.task("branch2State1").task("branch2State2"),
        opts
      )
    );

    expect(notifyTasks1.branches).toHaveLength(2);
    expect(notifyTasks2.branches).toHaveLength(2);
    expect(notifyTasks3.branches).toHaveLength(2);
  });

  it("Defining parallel should be able to be configured by step function shorthand", () => {
    const parallelOptions: IParallelOptions = { comment: "foo" };

    const customerEmailNotification = State((s) => s.task("customerEmailNotification"));
    const employeeEmailNotification = State((s) => s.task("employeeEmailNotification"));
    const branch1 = [customerEmailNotification, employeeEmailNotification];

    const smsNotification = State((s) => s.task("smsNotification"));
    const branch2 = [smsNotification];

    const notifyTasks = State((s) => s.parallel(branch1, branch2, parallelOptions));

    expect(notifyTasks.branches).toHaveLength(2);
    expect(notifyTasks).toContainEntries(Object.entries(parallelOptions));
  });
});
