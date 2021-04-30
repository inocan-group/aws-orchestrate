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

export type ChoiceCondition<T> = [T, IChoiceVariable];

export interface IChoiceItemApi{
  stringEquals(stepFn: IStepFnSelector, value: string, variable?: IChoiceVariable): this;
  booleanEquals(stepFn: IStepFnSelector, value: boolean, variable?: IChoiceVariable): this;
  stringGreaterThan(stepFn: IStepFnSelector, value: string, variable?: IChoiceVariable): this;
  stringGreaterThanEquals(stepFn: IStepFnSelector, value: string, variable?: IChoiceVariable): this;
  stringLessThan(stepFn: IStepFnSelector, value: string, variable?: IChoiceVariable): this;
  stringLessThanEquals(stepFn: IStepFnSelector, value: string, variable?: IChoiceVariable): this;
  numericEquals(stepFn: IStepFnSelector, value: number, variable?: IChoiceVariable): this;
  numericGreaterThan(stepFn: IStepFnSelector, value: number, variable?: IChoiceVariable): this;
  numericGreaterThanEquals(
    stepFn: IStepFnSelector,
    value: number,
    variable?: IChoiceVariable
  ): this;
  numericLessThan(stepFn: IStepFnSelector, value: number, variable?: IChoiceVariable): this;
  numericLessThanEquals(stepFn: IStepFnSelector, value: number, variable?: IChoiceVariable): this;
  default(stepFn: IStepFnSelector): this;
}

export interface IChoiceItemDefnFluentApi {
  stringEquals(stepFn: IStepFnSelector, value: string, variable?: IChoiceVariable): IChoiceItemParam;
  booleanEquals(stepFn: IStepFnSelector, value: boolean, variable?: IChoiceVariable): IChoiceItemParam;
  stringGreaterThan(
    stepFn: IStepFnSelector,
    value: string,
    variable?: IChoiceVariable
  ): IChoiceItemParam;
  stringGreaterThanEquals(
    stepFn: IStepFnSelector,
    value: string,
    variable?: IChoiceVariable
  ): IChoiceItemParam;
  stringLessThan(stepFn: IStepFnSelector, value: string, variable?: IChoiceVariable): IChoiceItemParam;
  stringLessThanEquals(
    stepFn: IStepFnSelector,
    value: string,
    variable?: IChoiceVariable
  ): IChoiceItemParam;
  numericEquals(stepFn: IStepFnSelector, value: number, variable?: IChoiceVariable): IChoiceItemParam;
  numericGreaterThan(
    stepFn: IStepFnSelector,
    value: number,
    variable?: IChoiceVariable
  ): IChoiceItemParam;
  numericGreaterThanEquals(
    stepFn: IStepFnSelector,
    value: number,
    variable?: IChoiceVariable
  ): IChoiceItemParam;
  numericLessThan(stepFn: IStepFnSelector, value: number, variable?: IChoiceVariable): IChoiceItemParam;
  numericLessThanEquals(
    stepFn: IStepFnSelector,
    value: number,
    variable?: IChoiceVariable
  ): IChoiceItemParam;
  default(stepFn: IStepFnSelector): IChoiceDefaultItemParam;
}

export interface IChoiceItemFluentApi {
  (c: IChoiceItemApi): IChoiceItemApi;
}

export function ChoiceItem(
  fluentApi: FluentApi<IChoiceItemDefnFluentApi, IChoiceItemParam | IChoiceDefaultItemParam>
) {
  const api: IChoiceItemDefnFluentApi = {
    stringEquals: (stepFn, value, variable) => {
      return { ...stringEquals(value), stepFn, variable };
    },
    booleanEquals: (stepFn, value, variable) => {
      return { ...booleanEquals(value), stepFn, variable };
    },
    stringGreaterThan: (stepFn, value, variable) => {
      return { ...stringGreaterThan(value), stepFn, variable };
    },
    stringGreaterThanEquals: (stepFn, value, variable) => {
      return { ...stringGreaterThanEquals(value), stepFn, variable };
    },
    stringLessThan: (stepFn, value, variable) => {
      return { ...stringLessThan(value), stepFn, variable };
    },
    stringLessThanEquals(stepFn, value, variable) {
      return { ...stringLessThanEquals(value), stepFn, variable };
    },
    numericEquals(stepFn, value, variable) {
      return { ...numericEquals(value), stepFn, variable };
    },
    numericGreaterThan(stepFn, value, variable) {
      return { ...numericGreaterThan(value), stepFn, variable };
    },
    numericGreaterThanEquals(stepFn, value, variable) {
      return { ...numericGreaterThanEquals(value), stepFn, variable };
    },
    numericLessThan(stepFn, value, variable) {
      return { ...numericLessThan(value), stepFn, variable };
    },
    numericLessThanEquals(stepFn, value, variable) {
      return { ...numericLessThanEquals(value), stepFn, variable };
    },
    default(stepFn) {
      console.log(stepFn);
      return { stepFn, kind: "defaultChoice" };
    },
  };

  return fluentApi(api);
}

function choiceItemFluent(fluentApi: IChoiceItemFluentApi) {
  const choiceApi = (state: (IChoiceItemParam | IChoiceDefaultItemParam)[]): IChoiceItemApi & { state: any } => {
    return {
      state,
      stringEquals: (stepFn, value, variable) => {
        return choiceApi([...state, { ...stringEquals(value), stepFn, variable }]);
      },
      booleanEquals: (stepFn, value, variable) => {
        return choiceApi([...state, { ...booleanEquals(value), stepFn, variable }]);
      },
      stringGreaterThan: (stepFn, value, variable) => {
        return choiceApi([...state, { ...stringGreaterThan(value), stepFn, variable }]);
      },
      stringGreaterThanEquals: (stepFn, value, variable) => {
        return choiceApi([...state, { ...stringGreaterThanEquals(value), stepFn, variable }]);
      },
      stringLessThan: (stepFn, value, variable) => {
        return choiceApi([...state, { ...stringLessThan(value), stepFn, variable }]);
      },
      stringLessThanEquals(stepFn, value, variable) {
        return choiceApi([...state, { ...stringLessThanEquals(value), stepFn, variable }]);
      },
      numericEquals(stepFn, value, variable) {
        return choiceApi([...state, { ...numericEquals(value), stepFn, variable }]);
      },
      numericGreaterThan(stepFn, value, variable) {
        return choiceApi([...state, { ...numericGreaterThan(value), stepFn, variable }]);
      },
      numericGreaterThanEquals(stepFn, value, variable) {
        return choiceApi([...state, { ...numericGreaterThanEquals(value), stepFn, variable }]);
      },
      numericLessThan(stepFn, value, variable) {
        return choiceApi([...state, { ...numericLessThan(value), stepFn, variable }]);
      },
      numericLessThanEquals(stepFn, value, variable) {
        return choiceApi([...state, { ...numericLessThanEquals(value), stepFn, variable }]);
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
