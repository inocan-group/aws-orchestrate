import { IStateMachine } from "common-types";
import { ErrDefn } from "./errorHandler";
import { IStepFn } from "./stepFunction";

/**
 * It's responsible of having the state of our state machine and provides several handful methods
 * needed to deploy or interact with our state machine
 */
export interface IStateMachineApi {
  /**
   * Generate a state machine definition object based on the required format for aws serverless
   */
  toJSON(): IStateMachine;
  /**
   * Transpiles the state machine definition into yaml
   */
  toYaml(): string;
  /**
   * Generate a graph to visualize the entire state machine definition
   */
  visualize(): any;
}

export interface IStateMachineParams extends Omit<IStateMachine, "definition" | "name"> {
  /**
   * Error handler used for all children states unless their overrites this one using `catch` option explicitely
   */
  defaultErrorHandler?: Record<string, ErrDefn>;
  /**
   * The root step function desired to be the start point for our sÍtate machine
   */
  stepFunction: IStepFn;
}

export interface IStateMachineFactory {
  (name: string, params: IStateMachineParams): IStateMachineApi;
}
