import { IDictionary } from "common-types";
import { ServerlessError } from "./ServerlessError";

export function isServerlessError<T extends Error>(err: T): err is ServerlessError {
  return (err as IDictionary).name === "ServerlessError";
}
