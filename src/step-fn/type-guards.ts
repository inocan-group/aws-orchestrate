import { ICatchConfig } from "./error-handler";

export function hasErrorConfigState(input: unknown): input is { state: ICatchConfig } {
  return typeof input === "object" && (input as any).state !== undefined;
}

export function hasState<TState>(input: unknown): input is { state: TState } {
  return typeof input === "object" && (input as any).state !== undefined;
}
