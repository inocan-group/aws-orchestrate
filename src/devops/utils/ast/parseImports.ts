import { ImportDeclaration, ts, Type } from "ts-morph";

/**
 * **parseVariable**
 *
 * given a `VariableDeclaration` passes back a relevant subset of information.
 */
export function parseImports(imports: ImportDeclaration[]) {
  return imports.map((i) => ({
    file: i.getSourceFile().getBaseName(),
    text: i.getText(),
    isTypeOnly: i.isTypeOnly(),
    kind: i.getKindName(),

    start: i.getStart(),
    end: i.getEnd(),
    type: i.getType() as Type<ts.Type>,
  }));
}

export type IParsedImport = ReturnType<typeof parseImports>[0];
