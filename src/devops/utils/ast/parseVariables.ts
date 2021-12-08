// eslint-disable no-eval
import { VariableDeclaration, WriterFunction, Type, ts } from "ts-morph";
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
  /** The type described in string form */
  typeAsString: any;
  /** The assigned value of variable */
  value: any;
  /** the _kind_ of variable */
  valueKind: string | undefined;
  /**
   * Boolean flag indicating whether the type informtion is
   * implicit (true) or explicitly stated (false)
   */
  isImplicitlyTyped: boolean;
}

/**
 * **parseVariable**
 *
 * given a `VariableDeclaration` passes back a relevant subset of information.
 */
export function parseVariables(v: VariableDeclaration[]): IParsedVariable[] {
  return v.map((i) => {
    const initializer = i.getInitializer();

    return {
      file: i.getSourceFile().getBaseName(),
      kind: i.getKindName(),
      name: i.getName(),
      text: i.getText(),
      // ts:
      value: initializer?.getText() ? eval(`(${initializer?.getText()})`) : undefined,
      valueKind: initializer?.getKindName(),
      isExported: i.isExported(),
      isNamedExport: i.isNamedExport(),
      isDefaultExport: i.isDefaultExport(),
      start: i.getStart(),
      end: i.getEnd(),
      statedType: i.getStructure().type,
      type: i.getType(),
      typeAsString: i.getType().getText(),
      isImplicitlyTyped: !i.getStructure().type && i.getType().getText() ? true : false,
    };
  });
}
