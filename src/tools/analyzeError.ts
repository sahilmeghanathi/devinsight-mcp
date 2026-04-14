import { analyzeErrorMessage } from "../core/errorEngine";

export function analyzeErrorTool(input: { error: string }) {
  const result = analyzeErrorMessage(input.error);

 return {
   ...result,
   error: input.error,
 };
}


