import { Project, SyntaxKind } from "ts-morph";
import path from "path";

const BATCH_SIZE = 10;

type UnusedFunction = {
  name: string;
  file: string;
  confidence: "high" | "medium" | "low";
  suggestion: string;
};

/**
 * Resolves all relevant source file paths and the set of imported file paths
 * using a short-lived Project instance that is disposed immediately after.
 */
function resolveProjectFilePaths(): {
  allFilePaths: string[];
  importedFilePaths: Set<string>;
} {
  const project = new Project({ tsConfigFilePath: "tsconfig.json" });

  const sourceFiles = project.getSourceFiles().filter((file) => {
    const ext = file.getExtension();
    return [".ts", ".tsx", ".js", ".jsx"].includes(ext);
  });

  const allFilePaths = sourceFiles.map((f) => f.getFilePath());

  const importedFilePaths = new Set<string>();
  sourceFiles.forEach((file) => {
    file.getImportDeclarations().forEach((imp) => {
      const sourceFile = imp.getModuleSpecifierSourceFile();
      if (sourceFile) {
        importedFilePaths.add(sourceFile.getFilePath());
      }
    });
  });

  // Dispose the project to free AST memory before returning
  project.getSourceFiles().forEach((f) => project.removeSourceFile(f));

  return { allFilePaths, importedFilePaths };
}

/**
 * Creates a fresh Project scoped to a single batch of files, analyzes
 * functions within those files for unused references, then disposes the
 * Project so memory is released before the next batch runs.
 */
function processFileBatch(
  filePaths: string[],
): UnusedFunction[] {
  const project = new Project({ tsConfigFilePath: "tsconfig.json" });

  // Restrict the project to only the files in this batch so the AST
  // footprint stays small.
  const allProjectFiles = project.getSourceFiles();
  allProjectFiles.forEach((f) => {
    if (!filePaths.includes(f.getFilePath())) {
      project.removeSourceFile(f);
    }
  });

  const batchResults: UnusedFunction[] = [];

  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach((file) => {
    const fileName = path.basename(file.getFilePath());
    const isJSX = file.getExtension().includes("x");

    // 1. Function declarations
    file.getFunctions().forEach((fn) => {
      const name = fn.getName() || "anonymous";
      if (!name) return;

      const refs = (fn as any).findReferences?.() || [];
      const refCount = refs.reduce(
        (acc: number, ref: any) => acc + ref.getReferences().length,
        0,
      );
      // Explicitly clear reference data after use
      refs.length = 0;

      const isReactComponent = isJSX && /^[A-Z]/.test(name);

      if (refCount <= 1) {
        batchResults.push({
          name,
          file: fileName,
          confidence: isReactComponent
            ? "low"
            : refCount === 0
              ? "high"
              : "medium",
          suggestion: isReactComponent
            ? "Check if used in JSX before removing"
            : "Safe to remove if not dynamically used",
        });
      }
    });

    // 2. Arrow functions & function expressions
    file
      .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
      .forEach((decl) => {
        const initializer = decl.getInitializer();

        if (
          initializer &&
          (initializer.getKind() === SyntaxKind.ArrowFunction ||
            initializer.getKind() === SyntaxKind.FunctionExpression)
        ) {
          const name = decl.getName();
          if (!name) return;

          const refs = (initializer as any).findReferences?.() || [];
          const refCount = refs.reduce(
            (acc: number, ref: any) => acc + ref.getReferences().length,
            0,
          );
          // Explicitly clear reference data after use
          refs.length = 0;

          const isReactComponent = isJSX && /^[A-Z]/.test(name);

          if (refCount <= 1) {
            batchResults.push({
              name,
              file: fileName,
              confidence: isReactComponent
                ? "low"
                : refCount === 0
                  ? "high"
                  : "medium",
              suggestion: isReactComponent
                ? "Check if used in JSX before removing"
                : "Safe to remove if not dynamically used",
            });
          }
        }
      });
  });

  // Dispose all source files in this project instance to release AST memory
  project.getSourceFiles().forEach((f) => project.removeSourceFile(f));

  return batchResults;
}

export function findUnusedCode() {
  const unusedFunctions: UnusedFunction[] = [];
  const unusedFiles: string[] = [];

  // Phase 1: Resolve file paths and import graph with a short-lived project
  const { allFilePaths, importedFilePaths } = resolveProjectFilePaths();

  // Phase 2: Detect unused functions by processing files in batches.
  // A new Project instance is created and disposed for each batch so that
  // AST memory never accumulates across the full file set.
  for (let i = 0; i < allFilePaths.length; i += BATCH_SIZE) {
    const batch = allFilePaths.slice(i, i + BATCH_SIZE);
    const batchResults = processFileBatch(batch);
    unusedFunctions.push(...batchResults);

    // Hint to the garbage collector that batch memory can be reclaimed
    if (global.gc) {
      global.gc();
    }
  }

  // Phase 3: Detect unused files using the import graph resolved in Phase 1
  allFilePaths.forEach((filePath) => {
    const fileName = path.basename(filePath);

    const isImported = importedFilePaths.has(filePath);

    // Ignore common entry files
    const isEntry =
      fileName.startsWith("index") ||
      fileName.startsWith("main") ||
      fileName.startsWith("app");

    if (!isImported && !isEntry) {
      unusedFiles.push(fileName);
    }
  });

  return {
    unusedFunctions,
    unusedFiles,
  };
}
