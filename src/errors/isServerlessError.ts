import { IDictionary } from "common-types";
import { ServerlessError } from "~/errors/ServerlessError";

export function isServerlessError(err: unknown): err is ServerlessError {
  return (err as IDictionary).name === "ServerlessError";
}
