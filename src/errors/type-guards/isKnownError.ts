import { IDictionary } from "common-types";
import { KnownError } from "~/errors/KnownError";

export function isKnownError<I extends any = unknown, O extends any = unknown, E extends Error = Error>(
  err: unknown
): err is KnownError<I, O, E> {
  return (err as IDictionary).kind === "KnownError";
}
