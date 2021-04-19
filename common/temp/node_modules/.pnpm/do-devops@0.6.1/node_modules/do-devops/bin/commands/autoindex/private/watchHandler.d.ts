import { IDictionary } from "common-types";
import { Stats } from "fs";
/**
 * configures a watch handler for an `autoindex` watched directory
 */
export declare function watchHandler(dir: string, options?: IDictionary): (evtBeingWatched: string) => (filepath: string, stats: Stats) => void;
