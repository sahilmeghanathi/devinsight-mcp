#!/usr/bin/env node
import { Server, } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport, } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { analyzeErrorMessage, analyzeMultipleErrors } from "./core/errorEngine.js";
import { findUnusedCode } from "./core/codeAnalyzer.js";
import { ErrorCache } from "./core/errorCache.js";
/**
 * DevInsight MCP Server
 * Provides error analysis and code health analysis via the Model Context Protocol
 */
// Initialize caches
const errorCache = new ErrorCache(1000);
// Define tools
const tools = [
    {
        name: "analyze_error",
        description: "Analyzes a JavaScript/TypeScript error message and provides root cause, fix suggestions, and code examples. Covers 100+ error patterns including TypeError, ReferenceError, and more.",
        inputSchema: {
            type: "object",
            properties: {
                error: {
                    type: "string",
                    description: "The error message to analyze (e.g., 'Cannot read property map of undefined')",
                },
                confidence_filter: {
                    type: "string",
                    enum: ["high", "medium", "low", "any"],
                    description: "Filter results by confidence level. Default: 'any'",
                },
            },
            required: ["error"],
        },
    },
    {
        name: "analyze_multiple_errors",
        description: "Analyzes multiple error messages at once and returns insights for each error.",
        inputSchema: {
            type: "object",
            properties: {
                errors: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                    description: "Array of error messages to analyze",
                },
            },
            required: ["errors"],
        },
    },
    {
        name: "find_unused_code",
        description: "Scans the TypeScript/JavaScript project to find unused functions and potentially unused files. Helps identify dead code that can be safely removed.",
        inputSchema: {
            type: "object",
            properties: {
                confidence_filter: {
                    type: "string",
                    enum: ["high", "medium", "low", "any"],
                    description: "Filter results by confidence level. Default: 'high'",
                },
            },
            required: [],
        },
    },
    {
        name: "clear_cache",
        description: "Clears internal error analysis cache to free memory.",
        inputSchema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
];
/**
 * Process tool call
 */
async function processToolCall(name, args) {
    switch (name) {
        case "analyze_error": {
            const { error, confidence_filter = "any" } = args;
            if (!error || typeof error !== "string") {
                return JSON.stringify({
                    error: "Invalid input",
                    message: "error parameter must be a non-empty string",
                });
            }
            // Check cache first
            const cacheKey = `${error}|${confidence_filter}`;
            const cached = errorCache.get(cacheKey);
            if (cached) {
                return JSON.stringify({ ...cached, cached: true });
            }
            try {
                const result = analyzeErrorMessage(error);
                // Filter by confidence if requested
                if (confidence_filter !== "any" &&
                    result.confidence !== confidence_filter) {
                    return JSON.stringify({
                        error,
                        message: `No matches with confidence level: ${confidence_filter}`,
                        confidence_filter,
                    });
                }
                // Cache result
                errorCache.set(cacheKey, result);
                return JSON.stringify(result);
            }
            catch (err) {
                return JSON.stringify({
                    error: "Analysis failed",
                    message: err instanceof Error ? err.message : String(err),
                });
            }
        }
        case "analyze_multiple_errors": {
            const { errors } = args;
            if (!Array.isArray(errors) || errors.length === 0) {
                return JSON.stringify({
                    error: "Invalid input",
                    message: "errors parameter must be a non-empty array",
                });
            }
            try {
                const results = analyzeMultipleErrors(errors);
                return JSON.stringify({
                    total: errors.length,
                    results,
                });
            }
            catch (err) {
                return JSON.stringify({
                    error: "Analysis failed",
                    message: err instanceof Error ? err.message : String(err),
                });
            }
        }
        case "find_unused_code": {
            const { confidence_filter = "high" } = args;
            try {
                const result = findUnusedCode();
                // Filter by confidence if requested
                let filteredFunctions = result.unusedFunctions;
                if (confidence_filter !== "any") {
                    filteredFunctions = result.unusedFunctions.filter((f) => f.confidence === confidence_filter);
                }
                return JSON.stringify({
                    unusedFunctions: filteredFunctions,
                    unusedFiles: result.unusedFiles,
                    summary: {
                        totalUnusedFunctions: filteredFunctions.length,
                        totalUnusedFiles: result.unusedFiles.length,
                    },
                });
            }
            catch (err) {
                return JSON.stringify({
                    error: "Code analysis failed",
                    message: err instanceof Error ? err.message : String(err),
                });
            }
        }
        case "clear_cache": {
            errorCache.clear();
            return JSON.stringify({
                success: true,
                message: "Cache cleared successfully",
            });
        }
        default:
            return JSON.stringify({
                error: "Unknown tool",
                message: `Tool '${name}' not found`,
            });
    }
}
/**
 * Main server initialization
 */
async function main() {
    const server = new Server({
        name: "devinsight-mcp",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Register tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools,
    }));
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name } = request.params;
        const args = request.params.arguments || {};
        const result = await processToolCall(name, args);
        return {
            content: [
                {
                    type: "text",
                    text: result,
                },
            ],
        };
    });
    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[DevInsight MCP] Server started successfully");
    console.error("[DevInsight MCP] Available tools: analyze_error, analyze_multiple_errors, find_unused_code, clear_cache");
}
main().catch((err) => {
    console.error("[DevInsight MCP] Fatal error:", err);
    process.exit(1);
});
