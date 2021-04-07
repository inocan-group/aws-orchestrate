import { IDictionary } from "common-types";
import { IOrchestratedDynamicProperty } from "~/types";

/**
 * A helper function for Orchestrators which produces a
 * dynamic reference. Usage would be:
 *
 * ```typescript
 * LambdaSequence
 *  .add('myFirstFn')
 *  .add('mySecondFn', { foo: dynamic<IFirstResponse>('myFirstFn', 'data') })
 * ```
 *
 * This will take the `data` output from **myFirstFn** and pass it into **mySecondFn**
 * as the property `foo`. If you pass in a generic type to `dynamic` it will enforce
 * the property name is indeed a response property for the given function.
 */
export function dynamic<T = any>(fn: string, prop?: keyof T): IOrchestratedDynamicProperty {
  return {
    type: "orchestrated-dynamic-property",
    lookup: `${fn}${prop ? `.${prop}` : ""}`,
  };
}

export function isDynamic(obj: IDictionary) {
  return !!(obj?.type === "orchestrated-dynamic-property" && obj.lookup);
}
