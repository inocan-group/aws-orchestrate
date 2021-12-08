import { RunTime } from "../types";
import { IGenericResource } from "../types/resources";

export function isResource(prop: unknown): prop is IGenericResource {
  return typeof prop === "object" && "Type" in (prop as Object) && "Properties" in (prop as Object);
}

export function isRunTimeResource(prop: unknown): prop is RunTime<IGenericResource> {
  if (typeof prop === "function") {
    try {
      const response = prop();
      return isResource(response);
    } catch {
      return false;
    }
  } else {
    return false;
  }
}
