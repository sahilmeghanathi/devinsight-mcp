import { analyzeErrorMessage } from "../core/errorEngine.js";
export function analyzeErrorTool(input) {
    const result = analyzeErrorMessage(input.error);
    return {
        ...result,
        error: input.error,
    };
}
