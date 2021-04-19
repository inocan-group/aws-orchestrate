import { ColorConfigurator } from "./fluent-types";
/**
 * Colorize text in the console.
 *
 * Choose a foreground color and optionally a background color.
 */
export declare const color: {
    red: (text?: string, bg?: ColorConfigurator | undefined) => string;
    magenta: (text?: string, bg?: ColorConfigurator | undefined) => string;
    black: (text?: string, bg?: ColorConfigurator | undefined) => string;
    yellow: (text?: string, bg?: ColorConfigurator | undefined) => string;
    green: (text?: string, bg?: ColorConfigurator | undefined) => string;
    brightRed: (text?: string, bg?: ColorConfigurator | undefined) => string;
};
