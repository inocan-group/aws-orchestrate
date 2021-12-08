export type RecordWith<T extends any> = Record<string, unknown> & Record<"config", T>;

/**
 * Type guard which detects and then provides a `config` property to an object which contains
 * one at run-time.
 */
export function hasConfigProperty<T extends unknown = unknown>(
  thingy: unknown
): thingy is RecordWith<T> {
  return typeof thingy === "object" && "config" in (thingy as Object);
}
