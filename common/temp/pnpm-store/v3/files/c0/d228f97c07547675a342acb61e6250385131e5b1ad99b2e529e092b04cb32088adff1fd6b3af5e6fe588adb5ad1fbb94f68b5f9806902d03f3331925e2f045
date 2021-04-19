import { IExportableSymbols } from "../index";
import { IDictionary } from "common-types";
export interface IExportCallbacks {
    file?: (file: string) => string;
    postFile?: () => string;
    dir?: (dir: string) => string;
    postDir?: () => string;
}
/**
 * The general template used for all export types.
 *
 * Uses passed in templates for file and directory exports
 * but then also adds any SFC files because this format is
 * unrelated to the chosen export type.
 */
export declare function exportTemplate(exportable: IExportableSymbols, opts: IDictionary, callbacks: IExportCallbacks): string;
