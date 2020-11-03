import { IStateMachine } from "common-types";
import { Finalized, IState } from ".";
import { IStepFn, IConfigurableStepFn, IFinalizedStepFn, IStepFnOptions, IStepFnSelector, IStepFnShorthand, IFluentApi } from "./stepFunction";

/**
 * It's responsible of having the state of our state machine and provides several handful methods
 * needed to deploy or interact with our state machine
 */
export interface IStateMachineApi {
  /**
   * Generate a state machine definition object based on the required format for aws serverless
   */
  toJSON(): IStateMachine
  /**
   * Transpiles the state machine definition into yaml
   */
  toYaml(): string
  /**
   * Generate a graph to visualize the entire state machine definition
   */
  visualize(): any
}

export interface IStateMachineParams {
  /**
   * Error handler used for all children states unless their overrites this one using `catch` option explicitely
   */
  defaultErrorHandler?: DefaultErrorHandler
  /**
   * The root step function desired to be the start point for our sÍtate machine
   */
  stepFunction: IStepFn
}

export interface IStateMachineFactory {
  (name: string, params: IStateMachineParams): IStateMachineApi
}

type ErrorType = 'TypeError' | 'Timeout' | string;

export type IErrorHandlerPointer = 
  IFluentApi | IStepFnShorthand | IStepFn

export type ConditionalHandler = Record<ErrorType, IErrorHandlerPointer>
export type DefaultErrorHandler = IErrorHandlerPointer | ConditionalHandler

const a1 = [1,2,3];
const a2 = new Array(1,2,3)

/**
 * 
 */
// sf = StepFunction().task().task()
// sf = StepFunction([t,t])
// c = c1 => [t,t,t,t], c2 => [s,s], c3=> [s]

// eh = StepFunction().task();
// { defaultErrorHandler: eh }
// { defaultErrorHandler: [ s1, s2]  }
// { defaultErrorHandler: s1 }

// const s1 = State(s => s.task('abc'));
// const sf1 = StepFunction(s1, failure);

// sf1 = s1(aaa),s2,s3,ts
// sf2 = s1(bbb),s2,s3,ts
// sf3 = s1, s2, fs4

