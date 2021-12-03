import {
  Finalized,
  FluentApi,
  IChoice,
  IChoiceCondition,
  IChoiceItemParam,
  IChoiceOptions,
  IChoiceVariable,
  IConfigurableStepFn,
  IChoiceDefaultItemParam,
  IFinalizedStepFn,
  IOperand_BooleanEquals,
  IOperand_NumericEquals,
  IOperand_NumericGreaterThan,
  IOperand_NumericGreaterThanEquals,
  IOperand_NumericLessThan,
  IOperand_NumericLessThanEquals,
  IOperand_StringEquals,
  IOperand_StringGreaterThan,
  IOperand_StringGreaterThanEquals,
  IOperand_StringLessThan,
  IOperand_StringLessThanEquals,
  IStepFnSelector,
  IStore,
  IChoiceItemApi,
  IChoiceItemConfigurator,
  IChoiceParams,
  IChoiceItemParamApi,
} from "~/types";
import { parseAndFinalizeStepFn } from "..";
import { hasState } from "../type-guards";

function stringEquals(value: string): Partial<IOperand_StringEquals> {
  return {
    stringEquals: value,
  };
}

function booleanEquals(value: boolean): Partial<IOperand_BooleanEquals> {
  return {
    booleanEquals: value,
  };
}

function stringGreaterThan(value: string): Partial<IOperand_StringGreaterThan> {
  return {
    stringGreaterThan: value,
  };
}

function stringGreaterThanEquals(value: string): Partial<IOperand_StringGreaterThanEquals> {
  return {
    stringGreaterThanEquals: value,
  };
}

function stringLessThan(value: string): Partial<IOperand_StringLessThan> {
  return {
    stringLessThan: value,
  };
}

function stringLessThanEquals(value: string): Partial<IOperand_StringLessThanEquals> {
  return {
    stringLessThanEquals: value,
  };
}

function numericEquals(value: number): Partial<IOperand_NumericEquals> {
  return {
    numericEquals: value,
  };
}

function numericGreaterThan(value: number): Partial<IOperand_NumericGreaterThan> {
  return {
    numericGreaterThan: value,
  };
}

function numericGreaterThanEquals(value: number): Partial<IOperand_NumericGreaterThanEquals> {
  return {
    numericGreaterThanEquals: value,
  };
}

function numericLessThan(value: number): Partial<IOperand_NumericLessThan> {
  return {
    numericLessThan: value,
  };
}

function numericLessThanEquals(value: number): Partial<IOperand_NumericLessThanEquals> {
  return {
    numericLessThanEquals: value,
  };
}

function extractChoiceParams(arg1: IStepFnSelector | IChoiceVariable, arg2?: IStepFnSelector) {
  if (arg2 !== undefined) {
    return {
      variable: arg1 as IChoiceVariable,
      stepFn: arg2 as IStepFnSelector,
    };
  }

  return { stepFn: arg1 as IStepFnSelector, variable: undefined };
}

/**
 *  Construct and child item of `Choice` State which starts with calling an operator as a fn name and
 *  it wraps a `condition` and a `step function`
 */
export function ChoiceItem(fluentApi: FluentApi<IChoiceItemParamApi, IChoiceItemParam>) {
  const api: IChoiceItemParamApi = {
    stringEquals(...[value, variable, stepFn]) {
      return { ...stringEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    booleanEquals(...[value, variable, stepFn]) {
      return { ...booleanEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    stringGreaterThan(...[value, variable, stepFn]) {
      return { ...stringGreaterThan(value), ...extractChoiceParams(variable, stepFn) };
    },
    stringGreaterThanEquals(...[value, variable, stepFn]) {
      return { ...stringGreaterThanEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    stringLessThan(...[value, variable, stepFn]) {
      return { ...stringLessThan(value), ...extractChoiceParams(variable, stepFn) };
    },
    stringLessThanEquals(...[value, variable, stepFn]) {
      return { ...stringLessThanEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    numericEquals(...[value, variable, stepFn]) {
      return { ...numericEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    numericGreaterThan(...[value, variable, stepFn]) {
      return { ...numericGreaterThan(value), ...extractChoiceParams(variable, stepFn) };
    },
    numericGreaterThanEquals(...[value, variable, stepFn]) {
      return { ...numericGreaterThanEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    numericLessThan(...[value, variable, stepFn]) {
      return { ...numericLessThan(value), ...extractChoiceParams(variable, stepFn) };
    },
    numericLessThanEquals(...[value, variable, stepFn]) {
      return { ...numericLessThanEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    default(stepFn) {
      return { stepFn, kind: "defaultChoice" };
    },
  };

  return fluentApi(api);
}

function configureChoiceItem(fluentApi: IChoiceItemConfigurator) {
  const choiceApi = (
    state: (IChoiceItemParam | IChoiceDefaultItemParam)[]
  ): IChoiceItemApi & { state: any } => {
    return {
      state,
      stringEquals(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...stringEquals(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      booleanEquals(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...booleanEquals(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      stringGreaterThan(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...stringGreaterThan(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      stringGreaterThanEquals(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...stringGreaterThanEquals(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      stringLessThan(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...stringLessThan(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      stringLessThanEquals(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...stringLessThanEquals(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      numericEquals(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...numericEquals(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      numericGreaterThan(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...numericGreaterThan(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      numericGreaterThanEquals(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...numericGreaterThanEquals(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      numericLessThan(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...numericLessThan(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      numericLessThanEquals(...[value, variable, stepFn]) {
        return choiceApi([
          ...state,
          { ...numericLessThanEquals(value), ...extractChoiceParams(variable, stepFn) },
        ]);
      },
      default(stepFn) {
        return choiceApi([...state, { stepFn, kind: "defaultChoice" }]);
      },
    };
  };
  return fluentApi(choiceApi([]));
}

function getDefaultChoiceStates(options: IChoiceDefaultItemParam) {
  const finalizedStepFn = parseAndFinalizeStepFn(options.stepFn);
  return { states: finalizedStepFn.getState() };
}

function isDefaultChoice(
  obj: IChoiceDefaultItemParam | IChoiceItemConfigurator | IChoiceItemParam | IChoiceOptions
): obj is IChoiceDefaultItemParam {
  return "kind" in obj && obj["kind"] === "defaultChoice";
}

const isFluentApi = (
  obj: IChoiceItemConfigurator | IChoiceItemParam | IChoiceOptions
): obj is IChoiceItemConfigurator => obj !== undefined && typeof obj === "function";

const isObjectDefinition = (obj: IChoiceItemParam | IChoiceOptions): obj is IChoiceItemParam =>
  obj !== undefined && "stepFn" in obj;

/**
 * A set of choice items which based on conditions follow a step function states
 */
export type IChoiceState = IChoice | Finalized<IChoice>;

/**
 *
 * @param params it accepts __choice items__ in shorthand and fluent api syntax and option hash as the last param
 * @returns IChoice | Finalized<IChoice>
 */
export function Choice(...params: IChoiceParams): IChoiceState {
  let defaultDfn, choiceOptions;
  const choicesDefn: IChoiceCondition[] = [];
  for (const param of params) {
    if (isDefaultChoice(param)) {
      defaultDfn = getDefaultChoiceStates(param);
    } else if (isFluentApi(param)) {
      const fluentResult = configureChoiceItem(param);
      if (!hasState<(IChoiceItemParam | IChoiceDefaultItemParam)[]>(fluentResult)) {
        throw new Error("Invalid choice item definition");
      }
      // eslint-disable-next-line unicorn/no-array-for-each
      fluentResult["state"].forEach((ci) => {
        if (isDefaultChoice(ci)) {
          defaultDfn = getDefaultChoiceStates(ci);
          return;
        }
        const { stepFn, ...rest } = ci;
        const finalizedStepFn = parseAndFinalizeStepFn(stepFn);

        choicesDefn.push({
          ...rest,
          finalizedStepFn,
        });
      });
    } else if (isObjectDefinition(param)) {
      const { stepFn, ...rest } = param;
      const finalizedStepFn = parseAndFinalizeStepFn(stepFn);

      choicesDefn.push({
        ...rest,
        finalizedStepFn,
      });
    } else {
      choiceOptions = param;
    }
  }

  return {
    type: "Choice",
    choices: choicesDefn,
    default: defaultDfn,
    ...choiceOptions,
    isTerminalState: true,
    ...(choiceOptions?.name !== undefined
      ? { name: choiceOptions?.name, isFinalized: true }
      : { isFinalized: false }),
  };
}

export function choiceWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (...params: IChoiceParams): IFinalizedStepFn => {
    commit(Choice(...params));

    return api().finalize();
  };
}
