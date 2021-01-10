import { createServerlessError, IServerlessError } from "brilliant-errors";

export const KnownError = createServerlessError("KnownError", {});
export type IKnownError = IServerlessError & { type: "KnownError" };
