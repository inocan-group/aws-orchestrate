import { IColor } from "../fluent-types";
export declare const RESET_FG = "\u001B[39m";
export declare const RESET_BG = "\u001B[49m";
/**
 * A dictionary of colors; first value is foreground,
 * second is background.
 */
export declare const COLOR: Record<IColor, [fg: number, bg: number]>;
