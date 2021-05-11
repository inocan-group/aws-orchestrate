import { Map, State, StepFunction } from "~/step-fn";
import { IMapOptions } from "~/types";

describe("Map State", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining map should be able to be configured by fluent API`", () => {
    const mapOptions: IMapOptions = { name: "notifyAllUsers", maxConcurrency: 2 };
    const sf1 = StepFunction()
      .task("emailNotification")
      .task("persistNotificationResults")
      .succeed();
    const notifyAllUsers = Map((m) => m.itemsPath("$.users").stepFunction(sf1).options(mapOptions));

    expect(notifyAllUsers.deployable.getState()).toHaveLength(3);
    expect(notifyAllUsers).toContainEntries(Object.entries(mapOptions));
  });

  it("Defining map should be able to be configured by step function shorthand and add terminal state if not defined", () => {
    const emailNotification = State((s) => s.task("emailNotification123"));
    const persistNotificationResults = State((s) => s.task("persistNotificationResults123"));

    const sf1 = StepFunction(emailNotification, persistNotificationResults);
    const notifyAllUsers = Map((m) =>
      m.itemsPath("$.users").stepFunction(sf1).options({ name: "notifyAllUsers" })
    );

    expect(notifyAllUsers.deployable.getState()).toHaveLength(2);
  });
});
