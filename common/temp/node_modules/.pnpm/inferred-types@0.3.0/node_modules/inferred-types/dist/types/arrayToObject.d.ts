/**
 * Takes a strongly typed array of objects and converts it into a dictionary
 * of objects while preserving the strong typing in the original objects.
 *
 * > **Note:** this depends on objects providing a `kind` property which distinguishes
 * the data structure of the object
 */
export declare function arrayToObjectKind<T extends {
    kind: S;
}, S extends PropertyKey>(
/** an array of objects */
arr: readonly T[]): { [V in T as V["kind"]]: V; };
/**
 * Takes a strongly typed array of objects and converts it into a dictionary
 * of objects while preserving the strong typing in the original objects.
 *
 * > **Note:** this depends on objects providing a `name` property which distinguishes
 * the data structure of the object
 */
export declare function arrayToObjectName<T extends {
    name: S;
}, S extends PropertyKey>(
/** an array of objects */
arr: readonly T[]): { [V in T as V["name"]]: V; };
/**
 * Takes an array of type `<T>` and spreads it out into a dictionary while preserving the type
 * literal value in `key` property.
 */
