// eslint-disable-next-line unicorn/import-style
import { relative } from "path";
import { Project, VariableDeclarationKind, CodeBlockWriter, IndentationText } from "ts-morph";
import { pascalize } from "native-dash";
import { IParsedSourceFile } from "./ast";
import { IFunctionPrepConfig, IStackOptions } from "~/devops/types/stack";

function getComment(f: IParsedSourceFile) {
  return (
    (f.variables.find((v) => v.name === "config")?.value?.description as string | undefined) ||
    f.comments.find((c) => c.symbolName === "fn")?.text
  );
}

function getName(s: IParsedSourceFile) {
  return pascalize(s.source.getBaseNameWithoutExtension());
}

function getLookup(files: IParsedSourceFile[], config: IFunctionPrepConfig) {
  const writer = (w: CodeBlockWriter) => {
    w.inlineBlock(() => {
      for (const f of files) {
        w.indent(0).write(`/** ${getComment(f) || getName(f)} */`);
        w.indent(0).writeLine(`${getName(f)}: {`);
        const configVar = f.variables.find((i) => i.name === "config");
        w.indent(1).write(`source: "${f.file}",\n`);
        w.indent(1).write(
          `target: "${f.file
            .replace(".ts", ".js")
            .replace(config.handlerLocation, config.buildDirectory)}",\n`
        );
        w.indent(1).write(`config: ${JSON.stringify(configVar?.value || {})}\n`);
        w.writeLine("},");
      }
    });
  };

  return writer;
}

/**
 * Given an array of handler files and associated meta
 * data, this function will build the `functions.ts` file
 * with TS type info for each file.
 */
export function buildLambdaTypes(
  handlers: IParsedSourceFile[],
  config: IFunctionPrepConfig,
  options: IStackOptions
) {
  const p = new Project({ manipulationSettings: { indentationText: IndentationText.TwoSpaces } });
  const typeFile = p.createSourceFile(
    options.typeFile
      ? relative(process.cwd(), options.typeFile)
      : relative(process.cwd(), "src/types/devops-types.ts"),
    "",
    {
      overwrite: true,
    }
  );

  typeFile.addImportDeclaration({
    moduleSpecifier: "aws-orchestrate/devops",
    isTypeOnly: true,
    namedImports: ["IHandlerFunction"],
  });

  typeFile.addEnum({
    name: "HandlerFunction",
    isConst: true,
    isExported: true,
    members: [
      ...handlers.map((i) => {
        const comment = getComment(i);
        return {
          leadingTrivia: `/** ${comment || "no comment provided"} */\n`,
          name: pascalize(i.source.getBaseNameWithoutExtension()),
          value: pascalize(i.source.getBaseNameWithoutExtension()),
        };
      }),
    ],
  });

  typeFile.addVariableStatement({
    leadingTrivia: "/** a dictionary which acts as a lookup for the handler functions defined */\n",
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: "handlerFnLookup",
        type: "Record<HandlerFunction, IHandlerFunction>",
        initializer: getLookup(handlers, config),
      },
    ],
  });
  console.log("ready to write");

  typeFile.saveSync();

  return relative(process.cwd(), typeFile.getFilePath());
}
