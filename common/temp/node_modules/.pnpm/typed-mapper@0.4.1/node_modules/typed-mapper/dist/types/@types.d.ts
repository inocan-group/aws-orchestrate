export declare type IFunctionalMapping<I, O> = (input?: I, set?: I[]) => O;
export declare type IStaticMapping<I> = keyof I;
export declare type IMapperConfiguration<I, O> = {
    [K in keyof O]: (keyof I & O[K]) | IFunctionalMapping<I, O[K]>;
};
export declare type IPassthroughConfig<I, O> = Array<keyof O> | true | false;
export declare type IExcludeConfig<I, O> = Array<keyof O> | false;
