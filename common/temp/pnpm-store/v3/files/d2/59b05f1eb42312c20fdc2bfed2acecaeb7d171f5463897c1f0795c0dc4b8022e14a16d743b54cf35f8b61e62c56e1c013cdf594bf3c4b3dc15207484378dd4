/**
 * Takes an object as input --which has an `id` property and returns it as the same
 * run-time content but with the _type_ of the `id` property being forced to a literal type
 */
export declare function idLiteral<T extends {
    id: I;
}, I extends PropertyKey>(o: T): T & {
    id: T["id"];
};
/**
 * Takes an object as input --which has an `name` property and returns it as the same
 * run-time content but with the _type_ of the `name` property being forced to a literal type
 */
export declare function nameLiteral<T extends {
    name: I;
}, I extends PropertyKey>(o: T): T & {
    name: T["name"];
};
/**
 * Takes an object as input --which has an `kind` property and returns it as the same
 * run-time content but with the _type_ of the `kind` property being forced to a literal type
 */
export declare function kindLiteral<T extends {
    kind: I;
}, I extends PropertyKey>(o: T): T & {
    kind: T["kind"];
};
export declare function idTypeGuard<T extends {
    id: I;
}, I extends PropertyKey>(_o: T): _o is T & {
    id: I;
};
