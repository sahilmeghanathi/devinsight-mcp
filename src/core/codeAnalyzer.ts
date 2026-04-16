import { Project, SyntaxKind, Node } from "ts-morph";
import path from "path";

type UnusedFunction = {
  name: string;
  file: string;
  confidence: "high" | "medium" | "low";
  suggestion: string;
};

export function findUnusedCode() {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const unusedFunctions: UnusedFunction[] = [];
  const unusedFiles: string[] = [];

  // ✅ Only relevant files
  const allFiles = project.getSourceFiles().filter((file) => {
    const ext = file.getExtension();
    return [".ts", ".tsx", ".js", ".jsx"].includes(ext);
  });

  // ✅ Track actual imported files (resolved paths)
  const importedFiles = new Set<string>();

  allFiles.forEach((file) => {
    file.getImportDeclarations().forEach((imp) => {
      const sourceFile = imp.getModuleSpecifierSourceFile();
      if (sourceFile) {
        importedFiles.add(sourceFile.getFilePath());
      }
    });
  });

  // 🔥 Helper to analyze any function
  function analyzeFunction(
    name: string,
    node: Node,
    fileName: string,
    isJSX: boolean,
  ) {
    if (!name) return;

    const sourceText = file.getFullText();
    const nameRegex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = sourceText.match(nameRegex) || [];
    const refCount = matches.length - 1; // -1 for the declaration itself

    const isReactComponent = isJSX && /^[A-Z]/.test(name);

    if (refCount <= 1) {
      unusedFunctions.push({
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

  // ✅ Detect unused functions (all types)
  allFiles.forEach((file) => {
    const fileName = path.basename(file.getFilePath());
    const isJSX = file.getExtension().includes("x");

    // 1. Function declarations
    file.getFunctions().forEach((fn) => {
      const name = fn.getName() || "anonymous";
      analyzeFunction(name, fn, fileName, isJSX);
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
          analyzeFunction(name, initializer, fileName, isJSX);
        }
      });
  });

  // ✅ Detect unused files (accurate)
  allFiles.forEach((file) => {
    const filePath = file.getFilePath();
    const fileName = path.basename(filePath);

    const isImported = importedFiles.has(filePath);

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
