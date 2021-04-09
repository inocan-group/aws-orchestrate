import { State } from "~/step-fn";
import { IMapOptions } from "~/types";

describe("Map State", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "fooregion";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("Defining map should be able to be configured by fluent API`", () => {
    const mapOptions: IMapOptions = { name: "notifyAllUsers", maxConcurrency: 2 };
    const notifyAllUsers = State(s =>
      s.map("$.users", mapOptions).use(s =>
        s
          .task("emailNotification")
          .task("persistNotificationResults")
          .succeed(),
      ),
    );

    expect(notifyAllUsers.deployable.getState()).toHaveLength(3);
    expect(notifyAllUsers).toContainEntries(Object.entries(mapOptions));
  });

  it("Defining map should be able to be configured by step function shorthand and add terminal state if not defined", () => {
    const emailNotification = State(s => s.task("emailNotification123"));
    const persistNotificationResults = State(s => s.task("persistNotificationResults123"));

    const notifyAllUsers = State(s =>
      s.map("$.users", { name: "notifyAllUsers" }).use([emailNotification, persistNotificationResults]),
    );

    expect(notifyAllUsers.deployable.getState()).toHaveLength(2);
  });

  it("Defining maps's items path without '$.' preffix should throw StepFunctionError", () => {
    const runWebScraper = State(s => s.task("runWebScraper"));
    const action = () => State(s => s.map("urls").use([runWebScraper]));

    expect(action).toThrowError({ name: "ServerlessError", message:"itemsPath urls is not allowed. It must start with \"$.\"" });
  });
});
