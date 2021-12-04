import { ExportAssignment } from "ts-morph";

export function parseExports(exps: ExportAssignment | ExportAssignment[]) {
  const assignments = Array.isArray(exps) ? exps : [exps];

  return assignments.map((i) => ({
    file: i.getSourceFile().getBaseName(),
    kind: i.getKindName(),
    children: i.forEachChild((c) => c.getKindName()),
  }));
}

export type IParsedExport = ReturnType<typeof parseExports>[0];
