export declare type Narrowable = string | number | bigint | boolean | [];
export declare type Narrow<A> = (A extends Narrowable ? A : never) | {
    [K in keyof A]: Narrow<A[K]>;
};
