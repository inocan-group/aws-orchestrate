import { IHandlerConfig, IHandlerFunction } from "~/types/wrapper-types";

const config: IHandlerConfig = {
  description: "Something not so profound",
};

const fn: IHandlerFunction<void, void> = async (_request, _context) => {
  //
};

export { config, fn };
