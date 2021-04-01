import { compress as c, decompress as d } from "lzutf8";
import { HttpStatusCodes } from "common-types";
import { ICompressedSection } from "../@types";
import { UnhandledError } from "../errors/UnhandledError";

/**
 * compresses large payloads larger than 4k (or whatever size
 * you state in the second parameter)
 */
export function compress<T = any>(data: T, ifLargerThan?: number): T | ICompressedSection {
  let payload: string;
  if (typeof data !== "string") {
    payload = JSON.stringify(data);
  } else {
    payload = data;
  }

  if (payload.length > (ifLargerThan || 4096)) {
    return {
      compressed: true,
      data: compressionHandler(payload),
    };
  } else {
    return data;
  }
}

function compressionHandler(data: string) {
  try {
    return c(data, { inputEncoding: "String", outputEncoding: "Base64" });
  } catch (e) {
    e.message = `Problem compressing section. Error message: ${
      e.message
    }\n\nText being compressed started with: ${data.slice(0, 10)}`;
    throw new UnhandledError(HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
  }
}

export function isCompressedSection<T>(data: T | ICompressedSection): data is ICompressedSection {
  return !!(typeof data === "object" && (data as ICompressedSection).compressed === true);
}

export function decompress<T = any>(data: T | ICompressedSection, parse = true): T {
  const parser = parse ? JSON.parse : (a: any) => a;

  return isCompressedSection(data) ? (parser(decompressionHandler(data)) as T) : (data as T);
}

function decompressionHandler<T>(section: ICompressedSection): T {
  try {
    return d(section.data, {
      inputEncoding: "Base64",
      outputEncoding: "String",
    });
  } catch (e) {
    e.message = `Problem decompressing section. Error message: ${
      e.message
    }\n\nText being decompressed started with: ${section.data.slice(0, 10)}`;
    throw new UnhandledError(HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
  }
}
