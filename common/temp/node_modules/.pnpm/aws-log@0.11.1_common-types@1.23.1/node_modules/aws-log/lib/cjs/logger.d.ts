import { IDictionary } from "common-types";
import { ILoggerApi } from "./logger/logging-api";
import { IContextApi } from "./logger/state";
import { IAwsLogConfig } from "./types";
export declare const logLevelLookup: IDictionary<number>;
export declare let config: IAwsLogConfig;
export declare function logger(requestedConfig?: Partial<IAwsLogConfig>): ILoggerApi & IContextApi;
