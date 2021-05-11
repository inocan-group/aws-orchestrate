import { Parallel, State, StepFunction } from "~/step-fn";

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
    const pFluent = Parallel((p) => p.addBranch([s1, s2]).addBranch([s3, s4]), opts);

    expect(pFluent.branches).toHaveLength(2);
  });

  it("Defining parallel should be able to be configured by step function shorthand", () => {
    const opts = { comment: "foo" };

    /**
     * Shorthand (1): Each array of states represents a step function (a branch)
     *
     */
    const pShorthand = Parallel(sf1, sf2, opts);

    /**
     * Shorthand (2): Accepts passing step function as branch in the leading params
     */
    const branch1 = StepFunction(s1, s2);
    const branch2 = StepFunction(s3, s4);
    const pShorthand2 = Parallel(branch1, branch2, opts);

    expect(pShorthand.branches).toHaveLength(2);
    expect(pShorthand2.branches).toHaveLength(2);
  });
});
