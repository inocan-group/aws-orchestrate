import { IAwsApiGatewayResponse } from "common-types";

export type IErrorHandlerFunction = (error: Error) => Promise<boolean> | boolean;

export interface IErrorClass extends Error {
  type?: string;
  code?: string;
  errorCode?: number;
  httpStatus?: number;
}

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
  error: IErrorClass;
}

export interface IDefaultHandlingCallback extends IDefaultHandlingBase {
  type: "handler-fn";
  defaultHandlerFn: IErrorHandlerFunction;
}

export interface IDefaultHandlingDefault extends IDefaultHandlingBase {
  type: "default";
}

export type IDefaultHandling =
  | IDefaultHandlingForwarding
  | IDefaultHandlingError
  | IDefaultHandlingCallback
  | IDefaultHandlingDefault;
