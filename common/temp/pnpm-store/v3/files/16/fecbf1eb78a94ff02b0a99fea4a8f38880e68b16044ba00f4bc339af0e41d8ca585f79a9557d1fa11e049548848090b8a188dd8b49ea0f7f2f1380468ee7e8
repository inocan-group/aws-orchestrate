export interface IConfigurator<P = {}, C = {}> {
    set<V, K extends string, KV = {
        [U in K]: V;
    }>(key: K, value: V): asserts this is IConfigurator<P, C & KV>;
    done(): C & Partial<P>;
}
/**
 * **Configurator**
 *
 * This function provides a configurator which uses TypeScript assertions
 * to narrow the scope of variables. Using type assertions though means we
 * can't also return values and therefore a _fluent_ API style is not possible.
 *
 * Note: this approach does require, that you explicitly use the `IConfigurator`
 * interface exported by this library. Without it you'd getting annoying TS errors
 * on every call to `set()` but adding it is simple enough:
 *
 * ```ts
 * import { Configurator, IConfigurator } from "inferred-types";
 * const config: IConfigurator = Configurator();
 * ```
 *
 * If you want to specify some guideline params which you expect to be set, you
 * can add them like so:
 *
 * ```ts
 * export type IExpected = { foo: number, bar: string };
 * const config: IConfigurator<IExpected> = Configurator<IExpected>();
 * ```
 *
 * This configuration will ensure that `foo` and `bar` will be seen as optional
 * parameters. If you set them they will stop being optional.
 */
export declare function Configurator<P extends {} = {}>(): IConfigurator<P, {}>;
