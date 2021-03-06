import { IStepFunctionMap, IStepFunctionParallel } from "common-types";
import { ChoiceItem, State, StateMachine, StepFunction } from "~/step-fn";

describe("Idempotence", () => {
  beforeEach(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_STAGE = "dev";
    process.env.AWS_ACCOUNT = "1234";
    process.env.APP_NAME = "abcapp";
  });

  it("All states definition without names should always be resolved the same auto-generated name if no definition has changed", () => {
    const task1 = State((s) => s.task("task1"));
    const task2 = State((s) => s.task("task2"));
    const pass1 = State((s) => s.pass());
    const initialStateMachine = StateMachine((s) =>
      s.stepFunction(StepFunction(task1, task2, pass1)).name("foo")
    ).toJSON();
    const statesOutput = Object.keys(initialStateMachine.definition.States);
    for (const _ of Array.from({ length: 20 }).fill(0)) {
      const currentStateMachine = StateMachine((s) =>
        s.stepFunction(StepFunction(task1, task2, pass1)).name("foo")
      ).toJSON();
      expect(Object.keys(currentStateMachine.definition.States)).toIncludeAllMembers(statesOutput);
    }
  });

  it("All states definition modified should not change other output states names", () => {
    const task1 = State((s) => s.task("task1"));
    const task2 = State((s) => s.task("task2"));
    const pass1 = State((s) => s.pass());
    const wait = State((s) => s.wait({ seconds: 60 }));
    const succeed = State((s) => s.succeed());

    const initialStateMachine = StateMachine((s) =>
      s.stepFunction(StepFunction(task1, task2, pass1, wait, succeed)).name("foo")
    ).toJSON();
    const initialStatesOuput = Object.keys(initialStateMachine.definition.States);
    const initialOutputWaitState = initialStatesOuput.find((s) => s.startsWith("Wait-"));

    for (let index = 0; index < 20; index++) {
      const modifiedWaitState = { ...wait, seconds: (wait.seconds || 0 + index) * 2 };
      const currentStateMachine = StateMachine((s) =>
        s.stepFunction(StepFunction(task1, task2, pass1, modifiedWaitState, succeed)).name("foo")
      ).toJSON();
      const currentStatesOutput = Object.keys(currentStateMachine.definition.States);
      const currentOutputWaitState = currentStatesOutput.find((s) => s.startsWith("Wait-"));

      expect(currentStatesOutput.filter((s) => s !== currentOutputWaitState)).toIncludeAllMembers(
        initialStatesOuput.filter((s) => s !== initialOutputWaitState)
      );
      expect(currentOutputWaitState).not.toEqual(initialOutputWaitState);
    }
  });

  it("choice conditions states definition without names should resolve always the same name event when parent state options has changed", () => {
    const task1 = State((s) => s.pass({ comment: "task1" }));
    const conditionATask1 = State((s) => s.pass({ comment: "conditionATask1" }));
    const conditionATask2 = State((s) => s.pass({ comment: "conditionATask2" }));

    const conditionBTask1 = State((s) => s.pass({ comment: "conditionBTask1" }));
    const conditionBTask2 = State((s) => s.pass({ comment: "conditionBTask2" }));
    const conditionA = ChoiceItem((c) => c.stringEquals("a", [conditionATask1, conditionATask2]));
    const conditionB = ChoiceItem((c) => c.stringEquals("b", [conditionBTask1, conditionBTask2]));
    const choice = State((s) => s.choice(conditionA, conditionB, { name: "myChoiceState" }));

    const initialStateMachine = StateMachine((s) =>
      s.stepFunction(StepFunction(task1, choice))
    ).toJSON();
    const initialStatesOuput = Object.keys(initialStateMachine.definition.States);

    for (const index of Array.from({ length: 20 }).fill(0)) {
      const modifiedChoice = { ...choice, comment: `foo-${index}` };
      const currentStateMachine = StateMachine((s) =>
        s.stepFunction(StepFunction(task1, modifiedChoice))
      ).toJSON();
      expect(Object.keys(currentStateMachine.definition.States)).toIncludeAllMembers(
        initialStatesOuput
      );
    }
  });

  it("adding new choice condition states definition prior to the existing should affect only condition states names", () => {
    const waitTask = State((s) => s.wait({ seconds: 50 }));
    const conditionATask1 = State((s) => s.pass({ comment: "conditionATask1" }));
    const conditionATask2 = State((s) => s.pass({ comment: "conditionATask2" }));

    const conditionBTask1 = State((s) => s.pass({ comment: "conditionBTask1" }));
    const conditionBTask2 = State((s) => s.pass({ comment: "conditionBTask2" }));
    const conditionA = ChoiceItem((c) => c.stringEquals("a", [conditionATask1, conditionATask2]));
    const conditionB = ChoiceItem((c) => c.stringEquals("b", [conditionBTask1, conditionBTask2]));
    const choice = State((s) => s.choice(conditionA, conditionB));

    const initialStateMachine = StateMachine((s) =>
      s.name("foo").stepFunction(StepFunction(waitTask, choice))
    ).toJSON();
    const initialOutputState = Object.keys(initialStateMachine.definition.States);
    const initialWaitStateName = initialOutputState.find((s) => s.startsWith("Wait-"));

    for (let index = 0; index < 20; index++) {
      const conditionCTask = State((s) => s.pass({ comment: `conditionCTask${index + 1}` }));
      const conditionC = ChoiceItem((c) => c.stringEquals("c", [conditionCTask]));
      const modifiedChoice = State((s) =>
        s.choice(conditionC, conditionA, conditionB, { name: "myChoiceState" })
      );
      const currentStateMachine = StateMachine((s) =>
        s.name("foo").stepFunction(StepFunction(waitTask, modifiedChoice))
      ).toJSON();
      const currentOutputState = Object.keys(currentStateMachine.definition.States);

      expect(currentOutputState).toIncludeAllMembers([initialWaitStateName]);
      expect(currentOutputState.filter((s) => s !== initialWaitStateName)).not.toIncludeAllMembers(
        initialOutputState
      );
    }
  });

  it("new states definition added in root definition should not change choice condition states names", () => {
    const task1 = State((s) => s.pass({ comment: "task1" }));
    const conditionATask1 = State((s) => s.pass({ comment: "conditionATask1" }));
    const conditionATask2 = State((s) => s.pass({ comment: "conditionATask2" }));

    const conditionBTask1 = State((s) => s.pass({ comment: "conditionBTask1" }));
    const conditionBTask2 = State((s) => s.pass({ comment: "conditionBTask2" }));
    const conditionA = ChoiceItem((c) => c.stringEquals("a", [conditionATask1, conditionATask2]));
    const conditionB = ChoiceItem((c) => c.stringEquals("b", [conditionBTask1, conditionBTask2]));
    const choice = State((s) => s.choice(conditionA, conditionB, { name: "myChoiceState" }));

    const initialStateMachine = StateMachine((s) =>
      s.name("foo").stepFunction(StepFunction(task1, choice))
    ).toJSON();
    const [initialOutputState, ...initialOutputRestState] = Object.keys(
      initialStateMachine.definition.States
    );

    for (const index of Array.from({ length: 20 }).fill(0)) {
      const modifiedTask = { ...task1, comment: `random${index}` };
      const currentStateMachine = StateMachine((s) =>
        s.name("foo").stepFunction(StepFunction(modifiedTask, choice))
      ).toJSON();
      const [currentOutputState, ...currentOutputRestState] = Object.keys(
        currentStateMachine.definition.States
      );
      expect(currentOutputState).not.toEqual(initialOutputState);
      expect(currentOutputRestState).toIncludeAllMembers(initialOutputRestState);
    }
  });

  it("map iterator states definition without names modified should not affect other iterator state names", () => {
    const task1 = State((s) => s.task("task1"));
    const pass1 = State((s) => s.pass({ comment: "pass1" }));
    const pass2 = State((s) => s.pass({ comment: "pass2" }));
    const pass3 = State((s) => s.pass({ comment: "pass3" }));
    const mapState = State((s) =>
      s.map((m) => m.itemsPath("$.items").stepFunction(StepFunction(pass1, pass2, pass3)))
    );

    const initialStateMachine = StateMachine((s) =>
      s.name("foo").stepFunction(StepFunction(task1, mapState))
    ).toJSON();
    const initialOutputState = Object.keys(initialStateMachine.definition.States);
    const initialOutputMapState = initialOutputState.find((s) => s.startsWith("Map-"));
    const [initialIteratorOutputTarget, ...initialIteratorOutputState] = Object.keys(
      // @ts-ignore
      (initialStateMachine.definition.States[initialOutputMapState] as IStepFunctionMap).Iterator
        .States
    );

    for (const index of Array.from({ length: 20 }).fill(0)) {
      const modifiedPass1 = { ...pass1, comment: `random${index}` };
      const currentMapState = State((s) =>
        s.map((m) => m.itemsPath("$.items").stepFunction(StepFunction(modifiedPass1, pass2, pass3)))
      );
      const currentStateMachine = StateMachine((s) =>
        s.name("foo").stepFunction(StepFunction(task1, currentMapState))
      ).toJSON();
      const currentOutputState = Object.keys(currentStateMachine.definition.States);
      const currentMapStateName = currentOutputState.find((s) => s.startsWith("Map-"));

      const [modifiedOutputState, ...currentIteratorOutputStates] = Object.keys(
        // @ts-ignore
        (currentStateMachine.definition.States[currentMapStateName] as IStepFunctionMap).Iterator
          .States
      );

      expect(modifiedOutputState).not.toEqual(initialIteratorOutputTarget);
      expect(currentIteratorOutputStates).toIncludeAllMembers(initialIteratorOutputState);
    }
  });

  it("map state definition change should change map iterator states names", () => {
    const task1 = State((s) => s.task("task1"));
    const pass1 = State((s) => s.pass({ comment: "pass1" }));
    const pass2 = State((s) => s.pass({ comment: "pass2" }));
    const pass3 = State((s) => s.pass({ comment: "pass3" }));
    const mapState = State((s) =>
      s.map((m) => m.itemsPath("$.items").stepFunction(StepFunction(pass1, pass2, pass3)))
    );

    const initialStateMachine = StateMachine((s) =>
      s.name("foo").stepFunction(StepFunction(task1, mapState))
    ).toJSON();
    const initialOutputState = Object.keys(initialStateMachine.definition.States);
    const initialOutputMapState = initialOutputState.find((s) => s.startsWith("Map-"));
    const [initialIteratorOutputTarget, ...initialIteratorOutputState] = Object.keys(
      // @ts-ignore
      (initialStateMachine.definition.States[initialOutputMapState] as IStepFunctionMap).Iterator
        .States
    );

    for (const [index, _] of Array.from({ length: 20 }).fill(0).entries()) {
      const modifiedPass1 = { ...pass1, comment: `random${index}` };
      const currentMapState = State((s) =>
        s.map((m) =>
          m
            .itemsPath("$.items")
            .options({ comment: "foo" })
            .stepFunction(StepFunction(modifiedPass1, pass2, pass3))
        )
      );
      const task2 = State((s) => s.task("task2"));
      const currentStateMachine = StateMachine((s) =>
        s.name("foo").stepFunction(StepFunction(task1, task2, currentMapState))
      ).toJSON();
      const currentOutputState = Object.keys(currentStateMachine.definition.States);
      const currentMapStateName = currentOutputState.find((s) => s.startsWith("Map-"));

      const [modifiedOutputState, ...currentIteratorOutputStates] = Object.keys(
        // @ts-ignore
        (currentStateMachine.definition.States[currentMapStateName] as IStepFunctionMap).Iterator
          .States
      );

      expect(initialOutputMapState).not.toEqual(currentMapStateName);
      expect(modifiedOutputState).not.toEqual(initialIteratorOutputTarget);
      expect(currentIteratorOutputStates).toIncludeAllMembers(initialIteratorOutputState);
    }
  });

  it("parallel branches states definition without names added after should not affect exisiting state branches states names", () => {
    const branch1Task1 = State((s) => s.pass({ comment: "branch1Task1" }));
    const branch1Task2 = State((s) => s.pass({ comment: "branch1Task2" }));
    const branch2Task1 = State((s) => s.pass({ comment: "branch2Task1" }));
    const branch2Task2 = State((s) => s.pass({ comment: "branch2Task1" }));

    const parallelState = State((s) =>
      s.parallel(
        StepFunction(branch1Task1, branch1Task2),
        StepFunction(branch2Task1, branch2Task2),
        {
          name: "myParallelState",
          comment: "foo",
        }
      )
    );

    const initialStateMachine = StateMachine((s) =>
      s.name("foo").stepFunction(StepFunction(parallelState))
    ).toJSON();
    const initialOutputBranches = (initialStateMachine.definition.States[
      "myParallelState"
    ] as IStepFunctionParallel).Branches;
    const initialOutputBranchesStates = initialOutputBranches.reduce((acc, curr) => {
      acc = [...acc, ...Object.keys(curr.States || {})];
      return acc;
    }, [] as string[]);

    for (const [index, _] of Array.from({ length: 20 }).fill(0).entries()) {
      const branch3 = StepFunction(State((s) => s.wait({ seconds: index + 1 })));
      const modifiedParallelState = State((s) =>
        s.parallel(
          StepFunction(branch1Task1, branch1Task2),
          StepFunction(branch2Task1, branch2Task2),
          branch3,
          {
            name: "myParallelState",
            comment: "sda",
          }
        )
      );
      const currentStateMachine = StateMachine((s) =>
        s.name("foo").stepFunction(StepFunction(modifiedParallelState))
      ).toJSON();
      const currentOutputBranches = (currentStateMachine.definition.States[
        "myParallelState"
      ] as IStepFunctionParallel).Branches;
      const currentOutputBranchesStates = currentOutputBranches.reduce((acc, curr) => {
        acc = [...acc, ...Object.keys(curr.States || {})];
        return acc;
      }, [] as string[]);

      expect(currentOutputBranchesStates).toIncludeAllMembers(initialOutputBranchesStates);
    }
  });

  it("parallel branches states definition without names added prior should affect exisiting state branches states names", () => {
    const branch1Task1 = State((s) => s.pass({ comment: "branch1Task1" }));
    const branch1Task2 = State((s) => s.pass({ comment: "branch1Task2" }));
    const branch2Task1 = State((s) => s.pass({ comment: "branch2Task1" }));
    const branch2Task2 = State((s) => s.pass({ comment: "branch2Task1" }));

    const parallelState = State((s) =>
      s.parallel(
        StepFunction(branch1Task1, branch1Task2),
        StepFunction(branch2Task1, branch2Task2),
        {
          name: "myParallelState",
          comment: "asda",
        }
      )
    );

    const initialStateMachine = StateMachine((s) =>
      s.name("foo").stepFunction(StepFunction(parallelState))
    ).toJSON();
    const initialOutputBranches = (initialStateMachine.definition.States[
      "myParallelState"
    ] as IStepFunctionParallel).Branches;
    const initialOutputBranchesStates = initialOutputBranches.reduce((acc, curr) => {
      acc = [...acc, ...Object.keys(curr.States || {})];
      return acc;
    }, [] as string[]);

    for (const [index, _] of Array.from({ length: 20 }).fill(0).entries()) {
      const branch3 = StepFunction(State((s) => s.wait({ seconds: index + 1 })));
      const modifiedParallelState = State((s) =>
        s.parallel(
          branch3,
          StepFunction(branch1Task1, branch1Task2),
          StepFunction(branch2Task1, branch2Task2),
          {
            name: "myParallelState",
            comment: "foo",
          }
        )
      );
      const currentStateMachine = StateMachine((s) =>
        s.name("foo").stepFunction(StepFunction(modifiedParallelState))
      ).toJSON();
      const currentOutputBranches = (currentStateMachine.definition.States[
        "myParallelState"
      ] as IStepFunctionParallel).Branches;
      const currentOutputBranchesStates = currentOutputBranches.reduce((acc, curr) => {
        acc = [...acc, ...Object.keys(curr.States || {})];
        return acc;
      }, [] as string[]);

      expect(currentOutputBranchesStates).not.toIncludeAllMembers(initialOutputBranchesStates);
    }
  });

  it("changing choice condition state definition nested with map should not affect map (children step fn) iterator state", () => {
    const nestedMapTask1 = State((s) => s.wait({ seconds: 60 }));
    const mapState = State((s) =>
      s.map((m) => m.itemsPath("$.items").name("myMap").stepFunction(StepFunction(nestedMapTask1)))
    );

    const conditionATask1 = State((s) => s.pass({ comment: "conditionATask1" }));
    const conditionATask2 = State((s) => s.pass({ comment: "conditionATask2" }));

    const conditionBTask1 = State((s) => s.pass({ comment: "conditionBTask1" }));
    const conditionBTask2 = State((s) => s.pass({ comment: "conditionBTask2" }));
    const conditionA = ChoiceItem((c) => c.stringEquals("a", [conditionATask1, conditionATask2]));
    const conditionB = ChoiceItem((c) =>
      c.stringEquals("b", [conditionBTask1, conditionBTask2, mapState])
    );
    const choice = State((s) => s.choice(conditionA, conditionB, { name: "myChoiceState" }));

    const initialStateMachine = StateMachine((s) =>
      s.name("foo").stepFunction(StepFunction(choice))
    ).toJSON();
    const initialOutputMapIterator = Object.keys(
      // @ts-ignore
      (initialStateMachine.definition.States["myMap"] as IStepFunctionMap).Iterator.States
    );

    for (let index = 0; index < 20; index++) {
      const conditionCTask = State((s) => s.pass({ comment: `conditionCTask${index + 1}` }));
      const conditionC = ChoiceItem((c) => c.stringEquals("c", [conditionCTask]));
      const modifiedChoice = State((s) =>
        s.choice(conditionC, conditionA, conditionB, { name: "myChoiceState" })
      );
      const currentStateMachine = StateMachine((s) =>
        s.name("foo").stepFunction(StepFunction(modifiedChoice))
      ).toJSON();
      const currentOutputMapIterator = Object.keys(
        // @ts-ignore
        (currentStateMachine.definition.States["myMap"] as IStepFunctionMap).Iterator.States
      );

      expect(currentOutputMapIterator).toIncludeAllMembers(initialOutputMapIterator);
    }
  });

  it("Creating a state machine without defininf a state should throw a exception", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const action = () => StateMachine((s) => s.stepFunction(StepFunction()));

    expect(action).toThrowError("There is no state defined in the root step function definition");
  });
});
