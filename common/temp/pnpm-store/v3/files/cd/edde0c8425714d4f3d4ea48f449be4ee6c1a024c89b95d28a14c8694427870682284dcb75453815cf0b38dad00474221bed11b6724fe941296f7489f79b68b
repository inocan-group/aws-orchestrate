export interface ISsmNameHints {
    stage?: string;
    version?: string;
}
/**
 * Generates the name of the SSM variable where the user typically just puts in the core name
 * and the stage and version must be determined.
 *
 * @param name
 * @param hints
 */
export declare function completeSsmName(name: string, hints?: ISsmNameHints): Promise<string>;
