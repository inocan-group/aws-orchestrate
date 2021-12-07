/* eslint-disable unicorn/no-array-for-each */
import { omit } from "native-dash";
import { FunctionDeclaration, SyntaxKind } from "ts-morph";

export function parseFunctions(fns: FunctionDeclaration[]) {
  return fns.map((f) => {
    const isAsync = f.isAsync();
    const isExported = f.isExported();
    const isDefaultExport = f.isDefaultExport();
    const isNamedExport = f.isNamedExport();
    const comments = f.getJsDocs().map((d) => ({
      comment: d.getComment(),
      params: d.getChildrenOfKind(SyntaxKind.JSDocParameterTag).map((p) => ({
        parameter: p.getName(),
        text: p.getText(),
        desc: p.getComment(),
      })),
      returns: d.getChildrenOfKind(SyntaxKind.JSDocReturnTag).map((p) => ({
        text: p.getText(),
        desc: p.getComment(),
      })),
    }));
    const parameters = f.getChildrenOfKind(SyntaxKind.Parameter).map((p) => ({
      name: p.getName(),
      type: p.getType().getText(),
      structure: omit(p.getStructure(), "type"),
    }));

    return {
      file: f.getSourceFile().getBaseName(),
      name: f.getName(),
      kind: f.getKindName(),
      text: f.getText(),
      typeAsString: f.getType().getText(),
      isAsync,
      isExported,
      isDefaultExport,
      isNamedExport,
      comments,
      parameters,
    };
  });
}

export type IParsedFunction = ReturnType<typeof parseFunctions>[0];
