import { IMapperConfiguration, IPassthroughConfig, IExcludeConfig } from "./index";
export declare class TypedMapper<I = any, O = any> {
    private _map?;
    private _aggregate?;
    private _data?;
    private _passthrough;
    private _exclude;
    static map<I = any, O = any>(config: IMapperConfiguration<I, O>): TypedMapper<I, O>;
    static passthrough<I = any, O = any>(config: IPassthroughConfig<I, O>): TypedMapper<I, O>;
    static exclude<I = any, O = any>(config: IExcludeConfig<I, O>): TypedMapper<I, O>;
    static aggregate<I = any, O = any>(config: IMapperConfiguration<I, O>): TypedMapper<I, O>;
    get mapConfig(): IMapperConfiguration<I, O> | undefined;
    map(config: IMapperConfiguration<I, O>): this;
    passthrough(config: IPassthroughConfig<I, O>): this;
    exclude(config: IExcludeConfig<I, O>): this;
    input(data: I | I[]): this;
    get inputData(): I | I[] | undefined;
    /**
     * Converts the input data, using the mapping configuration,
     * into the output format.
     */
    convert(data?: I | I[]): O | O[];
    convertArray(data?: I[]): O[];
    convertObject(data?: I): O;
    private _convertObject;
    private _convertArray;
    /**
     * Converts input data into an aggregate record
     */
    aggregate(config: IMapperConfiguration<I, O>): this;
}
