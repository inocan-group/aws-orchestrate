import { IAWSLambdaProxyIntegrationRequest, IDictionary } from "common-types";
import { ILambdaFunctionType, ILambdaSequenceStep, ILambdaSequenceNextTuple, ILambaSequenceFromResponse } from "./@types";
export declare class LambdaSequence {
    static add<T extends IDictionary = IDictionary>(arn: string, params?: Partial<T>, type?: ILambdaFunctionType): LambdaSequence;
    static from<T extends IDictionary = IDictionary>(event: T | IAWSLambdaProxyIntegrationRequest): ILambaSequenceFromResponse<T>;
    static notASequence(): LambdaSequence;
    private _steps;
    private _isASequence;
    add<T extends IDictionary = IDictionary>(arn: string, params?: Partial<T>, type?: ILambdaFunctionType): this;
    next<T extends IDictionary = IDictionary>(additionalParams?: Partial<T>, logger?: import("aws-log").ILoggerApi): ILambdaSequenceNextTuple<T>;
    from<T extends IDictionary = IDictionary>(request: T | IAWSLambdaProxyIntegrationRequest, logger?: import("aws-log").ILoggerApi): ILambaSequenceFromResponse<T>;
    isSequence(): boolean;
    isDone(): boolean;
    readonly remaining: ILambdaSequenceStep<IDictionary<any>>[];
    readonly completed: ILambdaSequenceStep<IDictionary<any>>[];
    readonly length: number;
    readonly steps: ILambdaSequenceStep<IDictionary<any>>[];
    readonly nextFn: ILambdaSequenceStep<IDictionary<any>>;
    readonly activeFn: ILambdaSequenceStep<IDictionary<any>>;
    readonly dynamicProperties: Array<{
        key: string;
        from: string;
    }>;
    toString(): string;
    toObject(): IDictionary<any>;
    toJSON(): IDictionary<any>;
}
