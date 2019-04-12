import { IAWSLambdaProxyIntegrationRequest, IDictionary } from "common-types";
import { ILambdaFunctionType, ILambdaSequenceStep } from "./@types";
export declare class LambdaSequence {
    static add<T extends IDictionary = IDictionary>(arn: string, params?: Partial<T>, type?: ILambdaFunctionType): LambdaSequence;
    static from<T extends IDictionary = IDictionary>(event: T | IAWSLambdaProxyIntegrationRequest): ILambaSequenceFromResponse<T>;
    static notASequence(): LambdaSequence;
    private _steps;
    private _isASequence;
    add<T extends IDictionary = IDictionary>(arn: string, params?: Partial<T>, type?: ILambdaFunctionType): this;
    next<T extends IDictionary = IDictionary>(additionalParams?: T): ILambdaSequenceNextTuple<T>;
    from<T extends IDictionary = IDictionary>(request: T | IAWSLambdaProxyIntegrationRequest): ILambaSequenceFromResponse<T>;
    isSequence(): boolean;
    isDone(): boolean;
    readonly length: number;
    readonly steps: ILambdaSequenceStep<IDictionary<any>>[];
}
export interface ILambaSequenceFromResponse<T> {
    request: T;
    apiGateway?: IAWSLambdaProxyIntegrationRequest;
    sequence: LambdaSequence;
}
export declare type ILambdaSequenceNextTuple<T> = [string, T];
