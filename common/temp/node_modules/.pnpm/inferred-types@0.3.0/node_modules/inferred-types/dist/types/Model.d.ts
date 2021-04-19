import * as t from "io-ts";
import { PascalCase } from "./types/index";
/**
 * Defines an `io-ts` based **model**.
 *
 * - `<T>` represents type of the model
 * - `<S>` is the model's literal type
 *
 * Note: unlink the default `io-ts` model/codec, the
 * `name` variable is an explicit type alias and not a string
 * type. This helps to preserve it's type inference even though
 * the model itself does have a runtime definition of it's type.
 */
export declare type IModel<M, N extends string> = Omit<t.Type<M>, "name"> & {
    name: N;
};
/**
 * **Model**
 *
 * A function which returns a `io-ts` based model/codec but with a _literal_ name
 * property, and a `kind` which uniquely distinguishes itself as a "model".
 *
 * **Note:** the name of a model is expected to be in _PascalCase_ and will be converted
 * to it if not passed in correctly.
 */
export declare function Model<RP extends t.Props, OP extends t.Props | {}, N extends string>(name: N, req: RP, optional?: OP): IModel<{ [K in keyof RP]: t.TypeOf<RP[K]>; } & { [K_1 in keyof OP]?: t.TypeOf<OP[K_1]> | undefined; }, PascalCase<N>>;
