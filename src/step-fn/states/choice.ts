import { ServerlessError } from "~/errors";
import {
  Finalized,
  IChoice,
  IChoiceConditionOptions,
  IChoiceOptions,
  IConfigurableStepFn,
  IDefaultChoiceOptions,
  IFinalizedStepFn,
  IFluentApi,
  IOperand,
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
  IStepFnConditionApi,
  IStepFnShorthand,
  IStore,
} from "~/types";
import { parseAndFinalizeStepFn } from "../";

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

export const condition = (
  cb: (api: IStepFnConditionApi) => Partial<IOperand> | Partial<IDefaultChoiceOptions>,
  stepFn: IFluentApi | IStepFnShorthand
) => {
  const api: IStepFnConditionApi = {
    stringEquals,
    stringGreaterThan,
    stringGreaterThanEquals,
    stringLessThan,
    stringLessThanEquals,
    numericEquals,
    numericGreaterThan,
    numericGreaterThanEquals,
    numericLessThan,
    numericLessThanEquals,
    booleanEquals,
  };

  const operand = cb(api);

  return {
    stepFn,
    ...operand,
  };
};

export function choice(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (choices: IChoiceConditionOptions[], options: IChoiceOptions): IFinalizedStepFn => {
    commit(choiceConfiguration(choices, options));

    return api().finalize();
  };
}

export function defaultChoice(stepFn: IFluentApi | IStepFnShorthand): IDefaultChoiceOptions {
  return {
    stepFn,
    kind: "defaultChoice",
  };
}

function getDefaultChoiceStates(options: IDefaultChoiceOptions) {
  const finalizedStepFn = parseAndFinalizeStepFn(options.stepFn);
  return { states: finalizedStepFn.getState() };
}

export function choiceConfiguration(
  choices: (IDefaultChoiceOptions | IChoiceConditionOptions)[],
  choiceOptions: IChoiceOptions
): IChoice | Finalized<IChoice> {
  const defaultChoiceIndex = choices.findIndex((c) => "kind" in c && c.kind === "defaultChoice");
  const defaultDfn =
    defaultChoiceIndex in choices
      ? getDefaultChoiceStates(choices[defaultChoiceIndex] as IDefaultChoiceOptions)
      : undefined;

  const conditionChoices = choices.filter((c) => !("kind" in c)) as IChoiceConditionOptions[];

  const choicesDefn = conditionChoices.map((c) => {
    const { stepFn, ...rest } = c;
    const finalizedStepFn = parseAndFinalizeStepFn(stepFn);

    return {
      ...rest,
      finalizedStepFn,
    };
  });

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
