import { ServerlessError } from "~/errors";
import { IWrapperContext } from "~/types";

export function handleServerlessError<Q, P>(error: ServerlessError, context: IWrapperContext<Q, P>) {
  //
}
