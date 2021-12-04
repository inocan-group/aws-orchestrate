import { VariableDeclaration, ts, Type, WriterFunction } from "ts-morph";

/**
 * A simplified set of information about a given variable
 */
export interface IParsedVariable {
  file: string;
  /** _name_ of the variable */
  name: string;
  /** Gets the text without leading trivia (comments and whitespace). */
  text: string;
  /**
   * boolean flag indicating if the node is exported from a namespace, is a default export,
   * or is a named export.*/
  isExported: boolean;
  /** boolean flag indicating if the node is a default export of a file. */
  isDefaultExport: boolean;
  /**
   * boolean flag indicating if the node is a named export of a file.
   */
  isNamedExport: boolean;
  /**
   * Gets the source file text position where the node starts that does not
   * include the leading trivia (comments and whitespace).
   */
  start: number;
  /**
   * Gets the source file text position where the node ends.
   *
   * @remarks — This does not include the following trivia (comments and whitespace).
   */
  end: number;
  /** the type as a string (only when explicitly defined) */
  statedType?: string | WriterFunction;
  /** the Typescript type definition */
  type: Type<ts.Type>;
}

/**
 * **parseVariable**
 *
 * given a `VariableDeclaration` passes back a relevant subset of information.
 */
export function parseVariables(v: VariableDeclaration | VariableDeclaration[]): IParsedVariable[] {
  const vars = Array.isArray(v) ? v : [v];
  return vars.map((i) => ({
    file: i.getSourceFile().getBaseName(),
    name: i.getName(),
    text: i.getText(),
    isExported: i.isExported(),
    isNamedExport: i.isNamedExport(),
    isDefaultExport: i.isDefaultExport(),
    start: i.getStart(),
    end: i.getEnd(),
    statedType: i.getStructure().type,
    type: i.getType(),
  }));
}
