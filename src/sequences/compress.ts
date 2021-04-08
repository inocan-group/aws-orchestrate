import { compress as c, decompress as d } from "lzutf8";
import { HttpStatusCodes } from "common-types";
import { UnhandledError } from "../errors/UnhandledError";
import { ICompressedSection } from "~/types";

/**
 * compresses large payloads larger than 4k (or whatever size
 * you state in the second parameter)
 */
export function compress<T = any>(data: T, ifLargerThan?: number): T | ICompressedSection {
  const payload = typeof data !== "string" ? JSON.stringify(data) : data;

  return payload.length > (ifLargerThan || 4096)
    ? {
        compressed: true,
        data: compressionHandler(payload),
      }
    : data;
}

function compressionHandler(data: string) {
  try {
    return c(data, { inputEncoding: "String", outputEncoding: "Base64" });
  } catch (error) {
    error.message = `Problem compressing section. Error message: ${
      error.message
    }\n\nText being compressed started with: ${data.slice(0, 10)}`;
    throw new UnhandledError(HttpStatusCodes.Conflict, error, "aws-orchestrate/decompress");
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
  } catch (error) {
    error.message = `Problem decompressing section. Error message: ${
      error.message
    }\n\nText being decompressed started with: ${section.data.slice(0, 10)}`;
    throw new UnhandledError(HttpStatusCodes.Conflict, error, "aws-orchestrate/decompress");
  }
}
