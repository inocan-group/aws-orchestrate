export function hasState(input: unknown): input is { state: Record<string, unknown> } {
  return typeof input === "object" && (input as any).state !== undefined;
}
