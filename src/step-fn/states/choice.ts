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
} from "~/types";
import { parseAndFinalizeStepFn } from "..";

const stringEquals = (value: string): Partial<IOperand_StringEquals> => {
  return {
    stringEquals: value,
  };
};

const booleanEquals = (value: boolean): Partial<IOperand_BooleanEquals> => {
  return {
    booleanEquals: value,
  };
};

const stringGreaterThan = (value: string): Partial<IOperand_StringGreaterThan> => {
  return {
    stringGreaterThan: value,
  };
};

const stringGreaterThanEquals = (value: string): Partial<IOperand_StringGreaterThanEquals> => {
  return {
    stringGreaterThanEquals: value,
  };
};

const stringLessThan = (value: string): Partial<IOperand_StringLessThan> => {
  return {
    stringLessThan: value,
  };
};

const stringLessThanEquals = (value: string): Partial<IOperand_StringLessThanEquals> => {
  return {
    stringLessThanEquals: value,
  };
};

const numericEquals = (value: number): Partial<IOperand_NumericEquals> => {
  return {
    numericEquals: value,
  };
};

const numericGreaterThan = (value: number): Partial<IOperand_NumericGreaterThan> => {
  return {
    numericGreaterThan: value,
  };
};

const numericGreaterThanEquals = (value: number): Partial<IOperand_NumericGreaterThanEquals> => {
  return {
    numericGreaterThanEquals: value,
  };
};

const numericLessThan = (value: number): Partial<IOperand_NumericLessThan> => {
  return {
    numericLessThan: value,
  };
};

const numericLessThanEquals = (value: number): Partial<IOperand_NumericLessThanEquals> => {
  return {
    numericLessThanEquals: value,
  };
};


type ChoiceConditionItem<T> = [T, IStepFnSelector] | [T, IChoiceVariable, IStepFnSelector];

export interface IChoiceItemApi {
  stringEquals(...params: ChoiceConditionItem<string>): this;
  booleanEquals(...params: ChoiceConditionItem<boolean>): this;
  stringGreaterThan(...params: ChoiceConditionItem<string>): this;
  stringGreaterThanEquals(...params: ChoiceConditionItem<string>): this;
  stringLessThan(...params: ChoiceConditionItem<string>): this;
  stringLessThanEquals(...params: ChoiceConditionItem<string>): this;
  numericEquals(...params: ChoiceConditionItem<number>): this;
  numericGreaterThan(...params: ChoiceConditionItem<number>): this;
  numericGreaterThanEquals(...params: ChoiceConditionItem<number>): this;
  numericLessThan(...params: ChoiceConditionItem<number>): this;
  numericLessThanEquals(...params: ChoiceConditionItem<number>): this;
  default(stepFn: IStepFnSelector): this;
}

export interface IChoiceItemDefnFluentApi {
  stringEquals(...params: ChoiceConditionItem<string>): IChoiceItemParam;
  booleanEquals(...params: ChoiceConditionItem<boolean>): IChoiceItemParam;
  stringGreaterThan(...params: ChoiceConditionItem<string>): IChoiceItemParam;
  stringGreaterThanEquals(...params: ChoiceConditionItem<string>): IChoiceItemParam;
  stringLessThan(...params: ChoiceConditionItem<string>): IChoiceItemParam;
  stringLessThanEquals(...params: ChoiceConditionItem<string>): IChoiceItemParam;
  numericEquals(...params: ChoiceConditionItem<number>): IChoiceItemParam;
  numericGreaterThan(...params: ChoiceConditionItem<number>): IChoiceItemParam;
  numericGreaterThanEquals(...params: ChoiceConditionItem<number>): IChoiceItemParam;
  numericLessThan(...params: ChoiceConditionItem<number>): IChoiceItemParam;
  numericLessThanEquals(...params: ChoiceConditionItem<number>): IChoiceItemParam;
  default(stepFn: IStepFnSelector): IChoiceDefaultItemParam;
}

export interface IChoiceItemFluentApi {
  (c: IChoiceItemApi): IChoiceItemApi;
}

function extractChoiceParams(arg1: IStepFnSelector | IChoiceVariable, arg2?: IStepFnSelector ) {
  if (arg2 !== undefined) {
    return {
      variable: arg1 as IChoiceVariable,
      stepFn: arg2 as IStepFnSelector
    };
  }

  return { stepFn: arg1 as IStepFnSelector, variable: undefined};
}

export function ChoiceItem(
  fluentApi: FluentApi<IChoiceItemDefnFluentApi, IChoiceItemParam | IChoiceDefaultItemParam>
) {
  const api: IChoiceItemDefnFluentApi = {
    stringEquals: (...[value, variable, stepFn]) => {
      return { ...stringEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    booleanEquals: (...[value, variable, stepFn]) => {
      return { ...booleanEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    stringGreaterThan: (...[value, variable, stepFn]) => {
      return { ...stringGreaterThan(value), ...extractChoiceParams(variable, stepFn) };
    },
    stringGreaterThanEquals: (...[value, variable, stepFn]) => {
      return { ...stringGreaterThanEquals(value), ...extractChoiceParams(variable, stepFn) };
    },
    stringLessThan: (...[value, variable, stepFn]) => {
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

function choiceItemFluent(fluentApi: IChoiceItemFluentApi) {
  const choiceApi = (
    state: (IChoiceItemParam | IChoiceDefaultItemParam)[]
  ): IChoiceItemApi & { state: any } => {
    return {
      state,
      stringEquals: (...[value, variable, stepFn]) => {
        return choiceApi([...state, { ...stringEquals(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      booleanEquals: (...[value, variable, stepFn]) => {
        return choiceApi([...state, { ...booleanEquals(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      stringGreaterThan: (...[value, variable, stepFn]) => {
        return choiceApi([...state, { ...stringGreaterThan(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      stringGreaterThanEquals: (...[value, variable, stepFn]) => {
        return choiceApi([...state, { ...stringGreaterThanEquals(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      stringLessThan: (...[value, variable, stepFn]) => {
        return choiceApi([...state, { ...stringLessThan(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      stringLessThanEquals(...[value, variable, stepFn]) {
        return choiceApi([...state, { ...stringLessThanEquals(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      numericEquals(...[value, variable, stepFn]) {
        return choiceApi([...state, { ...numericEquals(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      numericGreaterThan(...[value, variable, stepFn]) {
        return choiceApi([...state, { ...numericGreaterThan(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      numericGreaterThanEquals(...[value, variable, stepFn]) {
        return choiceApi([...state, { ...numericGreaterThanEquals(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      numericLessThan(...[value, variable, stepFn]) {
        return choiceApi([...state, { ...numericLessThan(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      numericLessThanEquals(...[value, variable, stepFn]) {
        return choiceApi([...state, { ...numericLessThanEquals(value), ...extractChoiceParams(variable, stepFn) }]);
      },
      default(stepFn) {
        return choiceApi([...state, { stepFn, kind: "defaultChoice" }]);
      },
    };
  };
  return fluentApi(choiceApi([]));
}

export type IChoiceParams =
  | [IChoiceItemFluentApi]
  | [IChoiceItemFluentApi, IChoiceOptions]
  | (IChoiceDefaultItemParam | IChoiceItemParam)[]
  | [...(IChoiceDefaultItemParam | IChoiceItemParam)[], IChoiceOptions];

export function choice(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (...params: IChoiceParams): IFinalizedStepFn => {
    commit(choiceConfiguration(...params));

    return api().finalize();
  };
}

function getDefaultChoiceStates(options: IChoiceDefaultItemParam) {
  const finalizedStepFn = parseAndFinalizeStepFn(options.stepFn);
  return { states: finalizedStepFn.getState() };
}

function isDefaultChoice(
  obj: IChoiceDefaultItemParam | IChoiceItemFluentApi | IChoiceItemParam | IChoiceOptions
): obj is IChoiceDefaultItemParam {
  return "kind" in obj && obj["kind"] === "defaultChoice";
}

const isFluentApi = (
  obj: IChoiceItemFluentApi | IChoiceItemParam | IChoiceOptions
): obj is IChoiceItemFluentApi => obj !== undefined && typeof obj === "function";

const isObjectDefinition = (obj: IChoiceItemParam | IChoiceOptions): obj is IChoiceItemParam =>
  obj !== undefined && "stepFn" in obj;

export function choiceConfiguration(...params: IChoiceParams): IChoice | Finalized<IChoice> {
  let defaultDfn, choiceOptions;
  const choicesDefn: IChoiceCondition[] = [];
  for (const param of params) {
    if (isDefaultChoice(param)) {
      defaultDfn = getDefaultChoiceStates(param);
    } else if (isFluentApi(param)) {
      const fluentResult = choiceItemFluent(param);
      "state" in fluentResult &&
        // eslint-disable-next-line unicorn/no-array-for-each
        (fluentResult["state"] as (IChoiceItemParam | IChoiceDefaultItemParam)[]).forEach((ci) => {
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
