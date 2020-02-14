import { ICompressedSection } from "../@types";
/**
 * compresses large payloads larger than 4k (or whatever size
 * you state in the second parameter)
 */
export declare function compress<T = any>(data: T, ifLargerThan?: number): T | ICompressedSection;
export declare function isCompressedSection<T>(data: T | ICompressedSection): data is ICompressedSection;
export declare function decompress<T = any>(data: T | ICompressedSection, parse?: boolean): T;
