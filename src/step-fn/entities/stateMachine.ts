/* eslint-disable unicorn/prefer-object-from-entries */
/* eslint-disable unicorn/consistent-function-scoping */
import {
  IDictionary,
  IStepFunctionStep,
  IStepFunctionCatcher,
  IStepFunctionChoiceItem,
  IStateMachine,
} from "common-types";
import { hash } from "native-dash";
import { parseArn } from "~/shared";
import {
  IErrorHandler,
  Finalized,
  IChoice,
  IFail,
  IGoTo,
  IMap,
  IParallel,
  IPass,
  IState,
  IStateMachineParams,
  IStepFn,
  IStepFnOptions,
  ISucceed,
  ITask,
  IWait,
  Result,
} from "~/types";
import { isFinalizedStepFn, parseStepFnSelector } from "~/step-fn";
import { ServerlessError } from "~/errors";
import {
  Catch,
  ICatchConfig,
  ICatchApiBuilder,
  IRetryConfig,
  IRetryFluentApi,
  Retry,
} from "../error-handler";
import { parsePartiallyQualifiedArn } from "~/shared/parse";

export const isFinalizedState = <T extends IState>(obj: T | Finalized<T>): obj is Finalized<T> =>
  "name" in obj && obj.name !== undefined;
const notAllowedKeys = new Set(["Name", "IsFinalized", "IsTerminalState"]);
const defaultExcluding = new Set(["parameters"]);

function toCamelCase(object: any, skip = false) {
  const result = Object.keys(object).reduce((acc, key) => {
    let val = object[key];
    if (typeof val === "object" && !defaultExcluding.has(key)) {
      val = toCamelCase(val);
    } else if (typeof val === "object" && defaultExcluding.has(key)) {
      val = toCamelCase(val, true);
    }

    if (!skip) {
      const [firstLetter, ...rest] = key;
      const cammelCase = `${firstLetter.toUpperCase()}${rest.join("")}`;

      if (!notAllowedKeys.has(cammelCase)) {
        acc[cammelCase] = val;
      }
    } else {
      acc[key] = val;
    }
    return acc;
  }, {} as any);

  return result;
}

function getCatchConfig(obj: ICatchConfig | ICatchApiBuilder) {
  return typeof obj === "function" ? Catch(obj) : obj;
}

function getRetryConfig(obj: IRetryConfig | IRetryFluentApi) {
  return typeof obj === "function" ? Retry(obj) : obj;
}

interface IStepFunctionParseContext {
  definitionStates: [string, IStepFunctionStep][];
  errorHandlerStates: [string, IStepFunctionStep][];
  validateState<T extends IState>(state: Finalized<T>): boolean;
  hashState: string;
}

export type IStateMachineBuilder<E extends string = ""> = Omit<
  {
    state: Partial<IStateMachineParams>;
    /**
     * The root step function desired to be the start point for our sÍtate machine
     */
    stepFunction<T extends string = "stepFunction">(
      stepFunction: IStepFn
    ): IStateMachineBuilder<E | T>;
    catch(val: ICatchConfig | ICatchApiBuilder): IStateMachineBuilder<E | "catch">;
    type<T extends string = "type">(val: IStateMachine["type"]): IStateMachineBuilder<E | T>;
    loggingConfig<T extends string = "loggingConfig">(
      val: false | IStateMachine["loggingConfig"]
    ): IStateMachineBuilder<E | T>;
    name<T extends string = "name">(val: string): IStateMachineBuilder<E | T>;
    addTracing<T extends string = "addTracing">(): IStateMachineBuilder<E | T>;
  },
  E
>;

export function StateMachine<T extends string = "state">(
  builder: (sm: IStateMachineBuilder<T>) => IStateMachineBuilder<any>
) {
  let stateMachineShortName: string = "";

  const defaultLoggingConfig = () => {
    return {
      level: "ALL",
      includeExecutionData: false,
      destinations: [
        parsePartiallyQualifiedArn(`state-machine-${stateMachineShortName}`, {
          resource: "log-group",
          service: "logs",
        }).arn + ":*",
      ],
    };
  };

  const api = <E extends string = "">(state: Partial<IStateMachineParams>) => {
    return {
      state,
      stepFunction(val: IStepFn) {
        return api<E | "stepFunction">({ ...state, stepFunction: val });
      },
      catch(val: ICatchConfig | ICatchApiBuilder) {
        return api<E | "catch">({ ...state, catch: val });
      },
      type(val: IStateMachine["type"]) {
        return api<E | "type">({ ...state, type: val });
      },
      loggingConfig(val: false | IStateMachine["loggingConfig"]) {
        return api<E | "loggingConfig">({
          ...state,
          loggingConfig: val
            ? {
                ...defaultLoggingConfig,
                ...val,
                destinations: val.destinations?.map(
                  (d) =>
                    parsePartiallyQualifiedArn(`state-machine-${d}`, {
                      resource: "log-group",
                      service: "logs",
                    }).arn + ":*"
                ),
              }
            : undefined,
        });
      },
      name(val: string) {
        stateMachineShortName = val;
        return api<E | "name">(state);
      },
      addTracing() {
        return api<E | "addTracing">({ ...state, tracingConfig: { enabled: true } });
      },
    };
  };

  // We need to case into the same type but without omitting certains types, such as state
  const builderOutput = builder(api({})) as IStateMachineBuilder<"">;
  if (!("state" in builderOutput)) {
    throw new ServerlessError(400, "State machine configuration is not defined", "bad-request");
  }

  const params = builderOutput.state;

  if (!params.stepFunction) {
    throw new ServerlessError(400, "No step function defined", "bad-request");
  }

  const { stepFunction, catch: statemachineCatchConfig, ...stateMachineOpts } = params;
  const finalizedStepFn = isFinalizedStepFn(stepFunction) ? stepFunction : stepFunction.finalize();

  if (!finalizedStepFn.getState()?.length) {
    throw new ServerlessError(
      400,
      "There is no state defined in the root step function definition",
      "bad-request"
    );
  }

  const processingStepFns: any = {};

  /**
   * Parses an array of states to a  AWS (`common-types`) type definition in order to be used to communicate to Amazon Web Services
   *
   * @param state The array of states that compose the step function to be parsed
   * @param options it can be used to alter how step function would be parsed. ex: namePreffix
   * @param offset its used to have more context to generate a appropiate hash for idempotence purpose
   */
  function parseStepFunction(
    state: Result<IState>[],
    options: IStepFnOptions,
    offset?: string | undefined
  ) {
    const definitionStates: [string, IStepFunctionStep][] = [];
    const errorHandlerStates: [string, IStepFunctionStep][] = [];
    const stepFnId =
      offset !== undefined
        ? `stepFn${
            offset in processingStepFns ? Object.keys(processingStepFns[offset]).length + 1 : 1
          }`
        : "root";

    if (offset === undefined) {
      processingStepFns[stepFnId] = state;
    } else {
      processingStepFns[offset] = {};
      processingStepFns[offset][stepFnId] = state;
    }

    let cachedStates: Record<string, true> = {};
    const stepFnHash = hash(JSON.stringify(state));

    const validateState =
      (_: number) =>
      <T extends IState>(finalizedState: Finalized<T>): boolean => {
        const stateHash = hash(finalizedState.name);
        const fullStateHash = `${stepFnHash}${stateHash}`;

        if (cachedStates !== undefined && cachedStates[fullStateHash] !== undefined) {
          throw new ServerlessError(400, "Finalized state must only be used once", "not-allowed");
        } else {
          cachedStates = { ...cachedStates, [fullStateHash]: true };
          return true;
        }
      };

    const parseTask =
      (ctx: IStepFunctionParseContext) =>
      (stateDefn: ITask | Finalized<ITask>, options: IStepFnOptions) => {
        const name = `${options.namePrefix || ""}${
          isFinalizedState(stateDefn) ? stateDefn.name : parseArn(stateDefn.resource).fn
        }`;
        const finalizedState =
          stateDefn.isFinalized === true && "name" in stateDefn
            ? stateDefn
            : ({ ...stateDefn, isFinalized: true, name } as Finalized<ITask>);

        const { catch: stateErrorHandler, retry, ...rest } = finalizedState;
        const retryconfig = retry ? getRetryConfig(retry) : undefined;
        const errorHandler = stateErrorHandler || options.catch;
        let errorHandlerResult: IStepFunctionCatcher[] | undefined;

        if (errorHandler !== undefined) {
          const catchConfig = getCatchConfig(errorHandler);
          const aggregate = Object.keys(catchConfig).map((k) =>
            parseErrorHandler(ctx)(k, catchConfig[k])
          );
          const errorStatesTuple: [string, IStepFunctionStep][] = aggregate.reduce((acc, curr) => {
            const k = Object.keys(curr[1]).map(
              (c) => [c, curr[1][c]] as [string, IStepFunctionStep]
            );
            acc = [...acc, ...k];
            return acc;
          }, [] as [string, IStepFunctionStep][]);
          ctx.errorHandlerStates.push(...errorStatesTuple);
          errorHandlerResult = aggregate.reduce((acc: IStepFunctionCatcher[], curr) => {
            acc = [...acc, ...curr[0]];
            return acc;
          }, []);
        }

        const state: [string, IStepFunctionStep] = [
          name,
          {
            ...toCamelCase(rest),
            Catch: errorHandlerResult,
            Retry: retryconfig
              ? Object.keys(retryconfig).reduce((acc: IStepFunctionStep[], curr) => {
                  acc = [...acc, { ErrorEquals: [curr], ...toCamelCase(retryconfig[curr]) }];
                  return acc;
                }, [])
              : undefined,
            End: finalizedState.isTerminalState ? true : undefined,
          },
        ];

        ctx.validateState(finalizedState);
        ctx.definitionStates.push(state);
      };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const parseSucceed =
      (ctx: IStepFunctionParseContext) =>
      (stateDefn: Result<ISucceed>, options: IStepFnOptions) => {
        const finalizedState =
          stateDefn.isFinalized === true && "name" in stateDefn
            ? stateDefn
            : ({
                ...stateDefn,
                isFinalized: true,
                name: `Succeed-${ctx.hashState}`,
              } as Finalized<ISucceed>);

        ctx.definitionStates.push([
          `${options.namePrefix || ""}${finalizedState.name}`,
          {
            Type: "Succeed",
            Comment: finalizedState.comment,
          },
        ]);
      };

    const parseFail =
      (ctx: IStepFunctionParseContext) =>
      (stateDefn: IFail | Finalized<IFail>, options: IStepFnOptions) => {
        const finalizedState =
          stateDefn.isFinalized === true && "name" in stateDefn
            ? stateDefn
            : ({
                ...stateDefn,
                isFinalized: true,
                name: `Fail-${ctx.hashState}`,
              } as Finalized<IFail>);

        ctx.definitionStates.push([
          `${options.namePrefix || ""}${finalizedState.name}`,
          {
            Type: "Fail",
            Cause: finalizedState.cause,
            Comment: finalizedState.comment,
          },
        ]);
      };

    const parseWait =
      (ctx: IStepFunctionParseContext) =>
      (stateDefn: IWait | Finalized<IWait>, options: IStepFnOptions) => {
        const finalizedState =
          stateDefn.isFinalized === true && "name" in stateDefn
            ? stateDefn
            : ({
                ...stateDefn,
                isFinalized: true,
                name: `Wait-${ctx.hashState}`,
              } as Finalized<IWait>);

        ctx.definitionStates.push([
          `${options.namePrefix || ""}${finalizedState.name}`,
          {
            Type: "Wait",
            ...toCamelCase(stateDefn),
          },
        ]);
      };

    const parsePass =
      (ctx: IStepFunctionParseContext) =>
      (stateDefn: IPass | Finalized<IPass>, options: IStepFnOptions) => {
        const finalizedState =
          stateDefn.isFinalized === true && "name" in stateDefn
            ? stateDefn
            : ({
                ...stateDefn,
                isFinalized: true,
                name: `Pass-${ctx.hashState}`,
              } as Finalized<IPass>);

        ctx.definitionStates.push([
          `${options.namePrefix || ""}${finalizedState.name}`,
          {
            Type: "Pass",
            ...toCamelCase(stateDefn),
          },
        ]);
      };

    const parseParallel =
      (ctx: IStepFunctionParseContext) =>
      (parallelDefinition: IParallel | Finalized<IParallel>, options: IStepFnOptions) => {
        const finalizedState =
          parallelDefinition.isFinalized === true && "name" in parallelDefinition
            ? parallelDefinition
            : ({
                ...parallelDefinition,
                isFinalized: true,
                name: `Parallel-${ctx.hashState}`,
              } as Finalized<IParallel>);

        const { catch: stateErrorHandler, branches, name: _, retry, ...rest } = finalizedState;
        const retryconfig = retry ? getRetryConfig(retry) : undefined;
        // eslint-disable-next-line unicorn/consistent-destructuring
        const stateName = `${options.namePrefix || ""}${finalizedState.name}`;

        const Branches = branches.map((branch) => {
          const branchOpts = branch.deployable.getOptions();
          return parseStepFunction(
            branch.deployable.getState(),
            {
              ...options,
              ...branchOpts,
            },
            `parallel-${ctx.hashState}`
          );
        });

        const errorHandler = stateErrorHandler || options.catch;
        let errorHandlerResult: IStepFunctionCatcher[] | undefined;

        if (errorHandler !== undefined) {
          const catchConfig = getCatchConfig(errorHandler);
          const aggregate = Object.keys(catchConfig).map((k) =>
            parseErrorHandler(ctx)(k, catchConfig[k])
          );
          const errorStatesTuple: [string, IStepFunctionStep][] = aggregate.reduce((acc, curr) => {
            const k = Object.keys(curr[1]).map(
              (c) => [c, curr[1][c]] as [string, IStepFunctionStep]
            );
            acc = [...acc, ...k];
            return acc;
          }, [] as [string, IStepFunctionStep][]);
          ctx.errorHandlerStates.push(...errorStatesTuple);
          errorHandlerResult = aggregate.reduce((acc: IStepFunctionCatcher[], curr) => {
            acc = [...acc, ...curr[0]];
            console.log(acc);
            return acc;
          }, []);
        }

        ctx.definitionStates.push([
          stateName,
          {
            ...toCamelCase(rest),
            Branches,
            Retry: retryconfig
              ? Object.keys(retryconfig).reduce((acc: IStepFunctionStep[], curr) => {
                  acc = [...acc, { ErrorEquals: [curr], ...toCamelCase(retryconfig[curr]) }];
                  return acc;
                }, [])
              : undefined,
            Catch: errorHandlerResult,
          },
        ]);
      };

    const parseMap =
      (ctx: IStepFunctionParseContext) =>
      (mapDefinition: IMap | Finalized<IMap>, options: IStepFnOptions) => {
        const finalizedState =
          mapDefinition.isFinalized === true && "name" in mapDefinition
            ? mapDefinition
            : ({
                ...mapDefinition,
                isFinalized: true,
                name: `Map-${ctx.hashState}`,
              } as Finalized<IMap>);

        const {
          catch: stateErrorHandler,
          deployable: iteratorStepFn,
          retry,
          ...stateOpts
        } = finalizedState;
        const retryconfig = retry ? getRetryConfig(retry) : undefined;
        // eslint-disable-next-line unicorn/consistent-destructuring
        const stateName = `${options.namePrefix || ""}${finalizedState.name}`;
        const Iterator = parseStepFunction(
          iteratorStepFn.getState(),
          {
            ...options,
            ...iteratorStepFn.getOptions(),
          },
          `map-${ctx.hashState}`
        );
        const errorHandler = stateErrorHandler || options.catch;
        let errorHandlerResult: IStepFunctionCatcher[] | undefined;

        if (errorHandler !== undefined) {
          const catchConfig = getCatchConfig(errorHandler);
          const aggregate = Object.keys(catchConfig).map((k) =>
            parseErrorHandler(ctx)(k, catchConfig[k])
          );
          const errorStatesTuple: [string, IStepFunctionStep][] = aggregate.reduce((acc, curr) => {
            const k = Object.keys(curr[1]).map(
              (c) => [c, curr[1][c]] as [string, IStepFunctionStep]
            );
            acc = [...acc, ...k];
            return acc;
          }, [] as [string, IStepFunctionStep][]);
          ctx.errorHandlerStates.push(...errorStatesTuple);
          errorHandlerResult = aggregate.reduce((acc: IStepFunctionCatcher[], curr) => {
            acc = [...acc, ...curr[0]];
            console.log(acc);
            return acc;
          }, []);
        }

        ctx.definitionStates.push([
          stateName,
          {
            ...toCamelCase(stateOpts),
            Iterator,
            Retry: retryconfig
              ? Object.keys(retryconfig).reduce((acc: IStepFunctionStep[], curr) => {
                  acc = [...acc, { ErrorEquals: [curr], ...toCamelCase(retryconfig[curr]) }];
                  return acc;
                }, [])
              : undefined,
            Catch: errorHandlerResult,
          },
        ]);
      };

    const parseChoice =
      (ctx: IStepFunctionParseContext) =>
      (choiceDefinition: IChoice | Finalized<IChoice>, options: IStepFnOptions) => {
        let choiceStates: IDictionary<IStepFunctionStep> = {};
        let conditions: IStepFunctionChoiceItem<IDictionary>[] = [];

        const finalizedState =
          choiceDefinition.isFinalized === true && "name" in choiceDefinition
            ? choiceDefinition
            : ({
                ...choiceDefinition,
                isFinalized: true,
                name: `Choice-${ctx.hashState}`,
              } as Finalized<IChoice>);

        // eslint-disable-next-line unicorn/no-array-for-each
        finalizedState.choices?.forEach((c) => {
          const { finalizedStepFn, ...rest } = c;

          const rawStepFn = finalizedStepFn.getState();
          const conditionOpts = finalizedStepFn.getOptions();
          const { States } = parseStepFunction(
            rawStepFn,
            {
              ...options,
              ...conditionOpts,
            },
            `choice-${ctx.hashState}`
          );

          choiceStates = { ...choiceStates, ...States };
          const nextState = Object.keys(States).shift();

          conditions = [
            ...conditions,
            {
              ...toCamelCase(rest),
              Next: nextState,
            },
          ];
        });

        let defaultChoice: string | undefined;
        if (finalizedState.default !== undefined && finalizedState.default.states) {
          const { States } = parseStepFunction(
            finalizedState.default.states,
            {
              ...options,
            },
            `choice-${ctx.hashState}`
          );
          choiceStates = { ...choiceStates, ...States };
          defaultChoice = Object.keys(States).shift();
        }

        ctx.definitionStates.push([
          `${options.namePrefix || ""}${finalizedState.name}`,
          {
            Type: "Choice",
            Choices: conditions,
            Default: defaultChoice,
          },
        ]);

        for (const [stateName, state] of Object.entries(choiceStates)) {
          ctx.definitionStates.push([stateName, state]);
        }
      };

    const parseGoTo = (ctx: IStepFunctionParseContext) => (stateDefn: IGoTo, _: IStepFnOptions) => {
      const lastState = ctx.definitionStates[ctx.definitionStates.length - 1][1];
      if (lastState && !("Next" in lastState && lastState.Next !== "")) {
        (ctx.definitionStates[ctx.definitionStates.length - 1][1] as any).Next = stateDefn.next;
      }
    };

    /**
     * Generate a hash of current step function being parsed __index__ and the state that calls this function
     *
     * @param index the index of the state that is going to be generated to hash along with step function index mentioned above
     */
    function hashState(index: number) {
      return hash(JSON.stringify({ stepFnIndex: stepFnId, ...state[index] })).toString();
    }

    const ctx = { definitionStates, errorHandlerStates, stepFnId };
    // eslint-disable-next-line unicorn/no-array-for-each
    state.forEach((stateDefn, index) => {
      const call = (fn: Function) =>
        fn({ ...ctx, hashState: hashState(index), validateState: validateState(index) })(
          stateDefn,
          options
        );

      const parseStateDefn: Record<string, Function> = {
        Task: parseTask,
        Succeed: parseSucceed,
        Fail: parseFail,
        Map: parseMap,
        Choice: parseChoice,
        Wait: parseWait,
        Parallel: parseParallel,
        Pass: parsePass,
        GoTo: parseGoTo,
      };
      call(parseStateDefn[stateDefn.type]);
    });

    const terminalStates = new Set(["Choice", "Succeed", "Fail"]);

    const stepFunctionDefn = definitionStates.reduce((acc, curr, index) => {
      const [stateName, stateDefn] = curr;
      acc[stateName] = stateDefn;
      const hasNextState = index + 1 in definitionStates;

      if (
        !terminalStates.has(stateDefn.Type) &&
        !("Next" in stateDefn && stateDefn.Next !== "") &&
        hasNextState &&
        !("End" in stateDefn && stateDefn.End)
      ) {
        (acc[stateName] as any).Next = definitionStates[index + 1][0];
      }

      return acc;
    }, {} as IDictionary<IStepFunctionStep>);

    const errorHandler = ctx.errorHandlerStates.reduce((acc, curr, index) => {
      const [stateName, stateDefn] = curr;
      acc[stateName] = stateDefn;

      const hasNextState = index + 1 in definitionStates;
      if (hasNextState) {
        (acc[stateName] as any).Next = definitionStates[index + 1][0];
        (acc[stateName] as any).End = undefined;
      }

      return acc;
    }, {} as IDictionary<IStepFunctionStep>);

    return {
      States: { ...stepFunctionDefn, ...errorHandler },
      StartAt: definitionStates[0][0],
    };
  }

  const parseErrorHandler =
    (ctx: IStepFunctionParseContext) =>
    (
      error: string,
      errorHandler: IErrorHandler
    ): [IStepFunctionCatcher[], IDictionary<IStepFunctionStep>] => {
      const errorHandlers: IStepFunctionCatcher[] = [];
      let errorStates: IDictionary<IStepFunctionStep> = {};

      const finalizedStepFn = parseStepFnSelector(errorHandler.selector);
      const { States } = parseStepFunction(
        finalizedStepFn.getState(),
        {
          ...finalizedStepFn.getOptions(),
          catch: undefined,
        },
        `errorHandler-${ctx.hashState}`
      );
      const [[next, _]] = Object.entries(States);

      errorStates = { ...errorStates, ...States };
      errorHandlers.push({
        ErrorEquals: [error],
        Next: next,
      });
      return [errorHandlers, errorStates];
    };

  const definition = parseStepFunction(finalizedStepFn.getState(), {
    catch: statemachineCatchConfig,
    ...finalizedStepFn.getOptions(),
  });
  const nameParts = parsePartiallyQualifiedArn(stateMachineShortName, {
    resource: "stateMachine",
    service: "states",
  });
  const stateMachine = {
    name: `${nameParts.appName}-${nameParts.stage}-${nameParts.stepFunction}`,
    definition,
    ...stateMachineOpts,
  };

  return {
    toJSON() {
      return JSON.parse(JSON.stringify(stateMachine));
    },
    visualize() {
      // TODO:
      return {};
    },
  };
}
