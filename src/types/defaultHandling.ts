import { IAwsApiGatewayResponse } from "common-types";
import { IError, IServerlessError } from "./error-types";

export type IErrorHandlerFunction<O, E extends IServerlessError = IServerlessError> = (error: E) => Promise<O | false>;

export function isApiGatewayResponse(response: unknown): response is IAwsApiGatewayResponse {
  return response !== null && typeof response === "object" && Object.keys(response as object).includes("statusCode");
}

export interface IDefaultHandlingBase {
  type: "error-forwarding" | "handler-fn" | "default-error" | "default";
  code: number;
  prop: string;
}

export interface IDefaultHandlingForwarding extends IDefaultHandlingBase {
  type: "error-forwarding";
  arn: string;
}

export interface IDefaultHandlingError extends IDefaultHandlingBase {
  type: "default-error";
  error: IError;
}

export interface IDefaultHandlingCallback<O> extends IDefaultHandlingBase {
  type: "handler-fn";
  defaultHandlerFn: IErrorHandlerFunction<O>;
}

export interface IDefaultHandlingDefault extends IDefaultHandlingBase {
  type: "default";
}

export type IDefaultHandling<O> =
  | IDefaultHandlingForwarding
  | IDefaultHandlingError
  | IDefaultHandlingCallback<O>
  | IDefaultHandlingDefault;
