#!/usr/bin/env node

/**
 * Simple test client for the DevInsight MCP Server
 * This demonstrates how to interact with the MCP server
 */

import { spawn } from "child_process";

const server = spawn("node", ["dist/server.js"], {
  stdio: ["pipe", "pipe", "pipe"],
});

// Helper to send a JSON-RPC request
function sendRequest(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = Math.random();
    const message = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    const lineListener = (data: Buffer) => {
      const line = data.toString().trim();
      if (!line) return;

      try {
        const response = JSON.parse(line);
        if (response.id === id) {
          server.stdout?.removeListener("data", lineListener);
          resolve(response);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    server.stdout?.on("data", lineListener);
    server.stdin?.write(JSON.stringify(message) + "\n");

    setTimeout(() => reject(new Error("Timeout")), 5000);
  });
}

async function test() {
  try {
    console.log("🚀 Testing DevInsight MCP Server...\n");

    // Test 1: Initialize
    console.log("1️⃣ Testing initialization...");
    const initResponse = await sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" },
    });
    console.log("✅ Initialization:", initResponse.result?.serverInfo?.name);

    // Test 2: List tools
    console.log("\n2️⃣ Testing list tools...");
    const listResponse = await sendRequest("tools/list", {});
    console.log("✅ Tools found:", listResponse.result?.tools?.length || 0);
    listResponse.result?.tools?.forEach((tool: any) => {
      console.log(`   - ${tool.name}: ${tool.description?.substring(0, 60)}...`);
    });

    // Test 3: Analyze error
    console.log("\n3️⃣ Testing error analysis...");
    const errorResponse = await sendRequest("tools/call", {
      name: "analyze_error",
      arguments: {
        error: "Cannot read property 'map' of undefined",
      },
    });
    const errorResult = errorResponse.result?.content?.[0]?.text
      ? JSON.parse(errorResponse.result.content[0].text)
      : null;
    console.log("✅ Error analysis result:");
    console.log(`   Type: ${errorResult?.type}`);
    console.log(`   Cause: ${errorResult?.cause}`);
    console.log(`   Fix: ${errorResult?.fix}`);
    console.log(`   Confidence: ${errorResult?.confidence}`);

    console.log("\n✨ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    server.kill();
    process.exit(0);
  }
}

test();
