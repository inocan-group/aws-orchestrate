import { IDictionary } from "common-types";
import { UnknownError } from "~/errors/UnknownError";

export function isUnknownError(err: unknown): err is UnknownError {
  return (err as IDictionary).kind === "UnknownError";
}
