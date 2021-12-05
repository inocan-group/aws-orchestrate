import { Project } from "ts-morph";
import { sync } from "globby";
import { parseSourceFile } from "./ast";

/**
 * **findHandlerFunctions**
 *
 * Finds all handler functions given the passed in glob pattern
 */
export function findHandlerFunctions(glob: string | string[]) {
  const g = Array.isArray(glob) ? glob : [glob];
  const candidates = sync(g);

  const project = new Project();
  project.addSourceFilesAtPaths(candidates);
  return project
    .getSourceFiles()
    .map((s) => parseSourceFile(s))
    .filter((s) => s.variables.some((v) => v.isNamedExport && v.name === "fn"));
}
