import { createError } from "brilliant-errors";

export const [DevopsError, isDevopsError] = createError("DevopsError", "aws-orchestrate")()()()();
