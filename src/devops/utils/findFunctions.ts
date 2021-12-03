import { createWrappedNode, Project, SyntaxKind } from "ts-morph";
import { sync } from "globby";

export async function findFunctions() {
  const candidates = sync([`${process.cwd()}/src/devops/**/*.ts`, "!**/index.ts"]);

  const project = new Project();
  project.addSourceFilesAtPaths(candidates);

  for (const source of candidates) {
    const file = project.getSourceFile(source);
    const exports = file.getVariableDeclarations();
    console.log({ exports });

    for (const exp of exports) {
      const n = exp.compilerNode;

      const compilerTypeChecker = exp.getProject().getTypeChecker();
      const type = createWrappedNode(n, { typeChecker: compilerTypeChecker })
        .asKindOrThrow(SyntaxKind.VariableDeclaration)
        .getType()
        .getText();
      console.log(`${source}::${exp.getKindName()} -> ${type}`);
    }
  }
}
