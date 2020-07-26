import { LambdaSequence } from "../LambdaSequence";
import { IDictionary } from "common-types";
import { IOrchestratedRequest } from "../@types";
export declare function buildOrchestratedRequest<T>(body: T, sequence?: LambdaSequence, 
/**
 * By default this function will include all _request headers_
 * such as the forwarding of _secrets_ but if you want to include
 * additional ones they can be added with this parameter.
 */
additionalHeaders?: IDictionary): IOrchestratedRequest<T>;
