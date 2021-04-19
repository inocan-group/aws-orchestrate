export interface IExistingMetaInfo {
    hasExistingMeta: boolean;
    /** all files found to already exist as exports */
    files: string[];
    /** all dirs found to already exist as exports */
    dirs: string[];
    /** all SFCs found to already exist as exports */
    sfcs: string[];
    /** the export type used last time autoindex was run */
    exportType: string;
    /** the _exclusions_ included last time autoindex was run */
    exclusions: string[];
}
/**
 * Gets all meta information about the prior state of the file contents
 */
export declare function getExistingMetaInfo(fileContent: string): IExistingMetaInfo;
