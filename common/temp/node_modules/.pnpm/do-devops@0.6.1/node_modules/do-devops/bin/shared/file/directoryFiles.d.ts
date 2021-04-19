import { Stats } from "fs";
/**
 * Given a passed in _directory_, this function returns the files in that directory
 * as well as their "stats".
 *
 * Note: _relative_ paths to the current working directory are assumed but you can
 * lead with the `/` character to indicate a full directory path
 */
export declare function directoryFiles(dir: string): {
    file: string;
    stats: Stats;
}[];
