import { analyzeErrorTool } from "./tools/analyzeError";
import { findUnusedCodeTool } from "./tools/findUnusedCode";

const args = process.argv.slice(2);

const command = args[0];

if (command === "analyze-error") {
  const error = args.slice(1).join(" ");
  const result = analyzeErrorTool({ error }); // ✅ FIX
  console.log(JSON.stringify(result, null, 2));
} else if (command === "find-unused") {
  const result = findUnusedCodeTool();
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`
Usage:
  analyze-error "error message"
  find-unused
  `);
}
