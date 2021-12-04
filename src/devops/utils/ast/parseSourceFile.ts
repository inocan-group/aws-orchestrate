import { omit } from "native-dash";
import { SourceFile } from "ts-morph";
import {
  IParsedComment,
  IParsedExport,
  IParsedImport,
  IParsedVariable,
  parseComments,
  parseExports,
  parseImports,
  parseVariables,
} from ".";

export type IParsedSourceFile = {
  file: string;
  imports: Omit<IParsedImport, "file">[];
  exports: Omit<IParsedExport, "file">[];
  variables: Omit<IParsedVariable, "file">[];
  comments: Omit<IParsedComment, "file">[];
};

export function parseSourceFile(source: SourceFile): IParsedSourceFile {
  const imports = parseImports(source.getImportDeclarations()).map((i) => omit(i, "file"));
  const exports = parseExports(source.getExportAssignments()).map((i) => omit(i, "file"));
  const variables = parseVariables(source.getVariableDeclarations()).map((i) => omit(i, "file"));
  const comments = parseComments(source).map((i) => omit(i, "file"));

  const file = "." + source.compilerNode.fileName.replace(process.cwd(), "");

  return {
    file,
    imports,
    exports,
    variables,
    comments,
  };
}
