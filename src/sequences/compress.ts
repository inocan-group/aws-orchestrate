import { compress as c, decompress as d } from "lzutf8";
import { ICompressedSection } from "../@types";

/**
 * compresses large payloads larger than 4k (or whatever size
 * you state in the second parameter)
 */
export function compress<T = any>(
  data: T,
  ifLargerThan?: number
): T | ICompressedSection {
  let payload: string;
  if (typeof data !== "string") {
    payload = JSON.stringify(data);
  }

  if (payload.length > (ifLargerThan || 4096)) {
    return {
      compressed: true,
      data: c(payload)
    };
  } else {
    return data;
  }
}

export function decompress<T = any>(
  data: T | ICompressedSection,
  parse: boolean = true
): T {
  if (
    typeof data === "object" &&
    (data as ICompressedSection).compressed === true
  ) {
    return parse ? (JSON.parse(d(data)) as T) : (d(data) as T);
  }

  return data as T;
}
