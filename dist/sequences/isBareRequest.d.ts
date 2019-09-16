import { IOrchestrationRequestTypes, IBareRequest } from "../@types";
export declare function isBareRequest<T>(event: IOrchestrationRequestTypes<T>): event is IBareRequest<T>;
