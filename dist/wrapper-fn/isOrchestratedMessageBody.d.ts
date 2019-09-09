import { IOrchestratedMessageBody } from "../@types";
/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IOrchestratedMessageBody`
 */
export declare function isOrchestratedMessageBody<T>(msg: T | IOrchestratedMessageBody<T>): boolean;
