import { IDictionary } from "common-types";
export interface ILambdaSequenceStep<T = IDictionary> {
    arn: string;
    params: Partial<T>;
    type: ILambdaFunctionType;
}
export declare type ILambdaFunctionType = "task" | "fan-out" | "step-start" | "fan-in" | "other";
