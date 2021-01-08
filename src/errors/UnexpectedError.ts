import { createServerlessError, IServerlessError } from "brilliant-errors";

export const UnexpectedError = createServerlessError("UnexpectedError", {});
export type IUnexpectedError = IServerlessError & { type: "UnexpectedError" };
