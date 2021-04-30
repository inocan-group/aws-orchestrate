import { State, StepFunction } from "~/step-fn";
import { IParallelOptions } from "~/types";

describe("Parallel State", () => {

  process.env.AWS_REGION = "us-east-1";
  process.env.AWS_STAGE = "dev";
  process.env.AWS_ACCOUNT = "1234 ";
  process.env.APP_NAME = "abcapp";

  const s1 = State((s) => s.task("foo"));
  const s2 = State((s) => s.task("bar"));
  const s3 = State((s) => s.task("baz"));
  const s4 = State((s) => s.task("quz"));

  const sf1 = [s1, s2];
  const sf2 = [s1, s3];

  it("Defining parallel should be able to configured by fluent API", () => {
    const opts = { comment: "foo" };

    /**
     * FluentAPI: You could define each branch/stepFn in fluent Api syntax separated by comma.
     * Optionally, accepts tail param as options hash
     */
    const pFluent = State((s) =>
      s.parallel((p) => p.addBranch([s1, s2]).addBranch([s3, s4]), opts)
    );

    /**
     * Composable (1): Each array of states represents a step function (a branch)
     *
     */
    const pShorthand = State((s) => s.parallel(sf1, sf2, opts));

    /**
     * Composable (2): Accepts passing step function as branch in the leading params
     */
    const branch1 = StepFunction(s1, s2);
    const branch2 = StepFunction(s3, s4);
    const pShorthand2 = State((s) => s.parallel(branch1, branch2, opts));


    expect(pFluent.branches).toHaveLength(2);
    expect(pShorthand.branches).toHaveLength(2);
    expect(pShorthand2.branches).toHaveLength(2);
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
