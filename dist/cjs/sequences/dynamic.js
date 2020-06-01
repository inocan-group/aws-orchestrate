"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDynamic = exports.dynamic = void 0;
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
function dynamic(fn, prop) {
    return {
        type: "orchestrated-dynamic-property",
        lookup: `${fn}${prop ? `.${prop}` : ""}`
    };
}
exports.dynamic = dynamic;
function isDynamic(obj) {
    return (obj === null || obj === void 0 ? void 0 : obj.type) === "orchestrated-dynamic-property" && obj.lookup
        ? true
        : false;
}
exports.isDynamic = isDynamic;
//# sourceMappingURL=dynamic.js.map