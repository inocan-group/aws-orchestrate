import { State } from "~/step-fn";
import { IParallelOptions } from "~/types";

describe("Parallel State", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234 ";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining parallel should be able to configured by fluent API", () => {
    const notifyTasks = State((s) =>
      s.parallel([(s) => s.task("emailNotification"), (s) => s.task("smsNotification")])
    );

    expect(notifyTasks.branches).toHaveLength(2);
  });

  it("Defining parallel should be able to be configured by step function shorthand", () => {
    const parallelOptions: IParallelOptions = { comment: "foo" };

    const stepFnOptions = { namePrefix: "email-" };
    const customerEmailNotification = State((s) => s.task("customerEmailNotification"));
    const employeeEmailNotification = State((s) => s.task("employeeEmailNotification"));
    const branch1 = [customerEmailNotification, employeeEmailNotification, stepFnOptions];

    const smsNotification = State((s) => s.task("smsNotification"));
    const branch2 = [smsNotification];

    const notifyTasks = State((s) => s.parallel([branch1, branch2], parallelOptions));

    expect(notifyTasks.branches).toHaveLength(2);
    expect(notifyTasks).toContainEntries(Object.entries(parallelOptions));
  });
});
