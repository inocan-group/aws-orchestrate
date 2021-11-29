/* eslint-disable no-use-before-define */
import { IDictionary } from "common-types";
import { IBaseOptions, IBaseState, IFinalizedStepFn, IState, IStepFnSelector, TerminalState } from "~/types";

export interface IChoiceOptions extends IBaseOptions {
  default?: IDefaultChoice;
}

export type IChoiceItemParam<T = IDictionary> = IChoiceItem<T> & {
  stepFn: IStepFnSelector;
};

export type IChoice = Omit<IChoiceOptions, "name"> &
  IBaseState & {
    readonly type: "Choice";
    choices: IChoiceCondition[];
  } & TerminalState;

export interface IChoiceCondition<T = IDictionary> extends Omit<IChoiceItemParam<T>, "stepFn"> {
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

export interface IComplexChoiceItem {
  and?: IOperand[];
  or?: IOperand[];
  not?: IOperand;
}
export interface IChoiceDefaultItemParam {
  kind: "defaultChoice";
  stepFn: IStepFnSelector;
}

export interface IDefaultChoice {
  states: IState[];
}

export type IChoiceParams =
  | [IChoiceItemConfigurator]
  | [IChoiceItemConfigurator, IChoiceOptions]
  | (IChoiceDefaultItemParam | IChoiceItemParam)[]
  | [...(IChoiceDefaultItemParam | IChoiceItemParam)[], IChoiceOptions];

  export interface IChoiceItemApi {
    stringEquals(...params: ChoiceConditionItem<string>): this ;
    booleanEquals(...params: ChoiceConditionItem<boolean>): this ;
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
  
  export interface IChoiceItemParamApi {
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

  type ChoiceConditionItem<T> = [T, IStepFnSelector] | [T, IChoiceVariable, IStepFnSelector];
  
  /**
   * provides an object with __conditions__ as methods names to compose choice items in fluent api syntax
   */
  export interface IChoiceItemConfigurator {
    (c: IChoiceItemApi): IChoiceItemApi;
  }