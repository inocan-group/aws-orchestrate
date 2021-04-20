import { IDictionary } from "common-types";
import { IBaseOptions, IBaseState, IFinalizedStepFn, IState, IStepFnSelector, TerminalState } from "~/types";

export interface IChoiceCallable {
  (choices: (IDefaultChoiceOptions | IChoiceConditionOptions)[], options?: IChoiceOptions): IFinalizedStepFn;
}

export interface IChoiceConfiguration {
  (choices: (IDefaultChoiceOptions | IChoiceConditionOptions)[], options?: IChoiceOptions): IChoice;
}

export interface IChoiceOptions extends IBaseOptions {
  default?: IDefaultChoice;
}

export type IChoiceConditionOptions<T = IDictionary> = IChoiceItem<T> & {
  stepFn: IStepFnSelector;
};

export type IChoice = Omit<IChoiceOptions, "name"> &
  IBaseState & {
    readonly type: "Choice";
    choices: IChoiceCondition[];
  } & TerminalState;

export interface IChoiceCondition<T = IDictionary> extends Omit<IChoiceConditionOptions<T>, "stepFn"> {
  finalizedStepFn: IFinalizedStepFn;
}
// TODO: Type passed through might be needed for later improvements
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export declare type IChoiceItem<T extends any = unknown> = Partial<IOperand> & IComplexChoiceItem;

export interface IOperand_BooleanEquals extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be equal to a stated string */
  booleanEquals?: boolean;
}
export interface IOperand_StringEquals extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be equal to a stated string */
  stringEquals?: string;
}
export interface IOperand_StringGreaterThan extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be equal to a stated string */
  stringGreaterThan?: string;
}
export interface IOperand_StringGreaterThanEquals extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be equal to a stated string */
  stringGreaterThanEquals?: string;
}
export interface IOperand_StringLessThan extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be equal to a stated string */
  stringLessThan?: string;
}
export interface IOperand_StringLessThanEquals extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be equal to a stated string */
  stringLessThanEquals?: string;
}
export interface IOperand_NumericEquals extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be numerically equal to a stated number */
  numericEquals?: number;
}
export interface IOperand_NumericGreaterThan extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be numerically equal to a stated number */
  numericGreaterThan?: number;
}
export interface IOperand_NumericGreaterThanEquals extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be numerically equal to a stated number */
  numericGreaterThanEquals?: number;
}
export interface IOperand_NumericLessThan extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be numerically equal to a stated number */
  numericLessThan?: number;
}
export interface IOperand_NumericLessThanEquals extends IBaseLogicalOperand {
  /** compare the value passed in -- and scoped by "Variable" -- to be numerically equal to a stated number */
  numericLessThanEquals?: number;
}
export interface IBaseLogicalOperand {
  /** points to the specific area of context which is being evaluated in the choice */
  variable: IChoiceVariable;
}

export type IChoiceVariable = `\$.${string}`;

export declare type IOperand =
  | IOperand_StringEquals
  | IOperand_BooleanEquals
  | IOperand_StringGreaterThan
  | IOperand_StringGreaterThanEquals
  | IOperand_StringLessThan
  | IOperand_StringLessThanEquals
  | IOperand_NumericEquals
  | IOperand_NumericGreaterThan
  | IOperand_NumericGreaterThanEquals
  | IOperand_NumericLessThan
  | IOperand_NumericLessThanEquals;

// TODO: this type had a generic type <T> but it was not used!
export interface IComplexChoiceItem {
  and?: IOperand[];
  or?: IOperand[];
  not?: IOperand;
}
export interface IStepFnConditionApi<T extends any = unknown> {
  stringEquals: (value: string, variable?: IChoiceVariable) => T;
  stringGreaterThan: (value: string, variable?: IChoiceVariable) => T;
  stringGreaterThanEquals: (value: string, variable?: IChoiceVariable) => T;
  stringLessThan: (value: string, variable?: IChoiceVariable) => T;
  stringLessThanEquals: (value: string, variable?: IChoiceVariable) => T;
  numericEquals: (value: number, variable?: IChoiceVariable) => T;
  numericGreaterThan: (value: number, variable?: IChoiceVariable) => T;
  numericGreaterThanEquals: (value: number, variable?: IChoiceVariable) => T;
  numericLessThan: (value: number, variable?: IChoiceVariable) => T;
  numericLessThanEquals: (value: number, variable?: IChoiceVariable) => T;
  booleanEquals: (value: boolean, variable?: IChoiceVariable) => T;
}
export interface IStepFnConditionApiParam {}

export interface IDefaultChoiceOptions {
  kind: "defaultChoice";
  stepFn: IStepFnSelector;
}

export interface IDefaultChoice {
  states: IState[];
}

export type IStepFnCondition = (
  cb: IStepFnConditionApiParam,
  stepFn: IStepFnSelector,
  variable?: any
) => IChoiceConditionOptions;
