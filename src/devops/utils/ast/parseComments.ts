import { SourceFile, SyntaxKind } from "ts-morph";

export type IParsedComment = {
  file: string;
  commentPosition: "leading" | "trailing";
  stmtKind: string;
  stmt: string;
  symbolName: string;
  symbolType: "function" | "variable" | "unknown";
  kind: SyntaxKind;
  text: string;
  pos: number;
  width: number;
  end: number;
};

export function parseComments(source: SourceFile) {
  const comments = source.getStatementsWithComments().reduce((acc, stmt) => {
    const variableName = stmt
      .getChildrenOfKind(SyntaxKind.VariableDeclarationList)
      .map((i) => i.getChildrenOfKind(SyntaxKind.VariableDeclaration)[0].getName())[0];
    const fnName = stmt.getChildrenOfKind(SyntaxKind.FunctionKeyword)[0]?.getSymbol()?.getName();
    const leading = stmt
      .getLeadingCommentRanges()
      .filter((i) => i)
      .flatMap((r) => {
        return {
          file: source.getBaseName(),
          commentPosition: "leading",
          stmtKind: stmt.getKindName(),
          stmt: stmt.getText(),
          symbolName: fnName || variableName,
          symbolType: fnName ? "function" : variableName ? "variable" : "unknown",
          kind: r.getKind(),
          text: r.getText(),
          pos: r.getPos(),
          width: r.getWidth(),
          end: r.getEnd(),
        } as IParsedComment;
      });
    const trailing = stmt
      .getTrailingCommentRanges()
      .filter((i) => i)
      .map((r) => {
        return {
          file: source.getBaseName(),
          commentPosition: "trailing",
          stmtKind: stmt.getKindName(),
          stmt: stmt.getText(),
          symbolName: fnName || variableName,
          symbolType: fnName ? "function" : variableName ? "variable" : "unknown",
          kind: r.getKind(),
          text: r.getText(),
          pos: r.getPos(),
          width: r.getWidth(),
          end: r.getEnd(),
        } as IParsedComment;
      });

    const cs = [...leading, ...trailing];
    if (cs.length > 0) {
      acc = [...acc, ...cs];
    }
    return acc;
  }, [] as IParsedComment[]);

  return comments;
}
