import { analyzeErrorMessage } from "../core/errorEngine.js";

export function analyzeErrorTool(input: { error: string }) {
  const result = analyzeErrorMessage(input.error);

 return {
   ...result,
   error: input.error,
 };
}


