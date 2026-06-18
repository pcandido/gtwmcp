#!/usr/bin/env node
// Mock MCP server for testing the GMCP gateway
// Implements a minimal MCP stdio server with a few tools

import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

const TOOLS = [
  {
    name: "echo",
    description: "Echoes back the input message",
    inputSchema: {
      type: "object",
      properties: { message: { type: "string", description: "The message to echo" } },
      required: ["message"],
    },
  },
  {
    name: "add",
    description: "Add two numbers",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" },
      },
      required: ["a", "b"],
    },
  },
  {
    name: "get_time",
    description: "Returns the current server time",
    inputSchema: { type: "object", properties: {} },
  },
];

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function respondError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
}

rl.on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line.trim());
  } catch {
    return;
  }

  if (!msg || !msg.method) return;

  if (msg.method === "initialize") {
    respond(msg.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "mock-server", version: "1.0.0" },
    });
  } else if (msg.method === "tools/list") {
    respond(msg.id, { tools: TOOLS });
  } else if (msg.method === "tools/call") {
    const { name, arguments: args } = msg.params || {};
    try {
      let result;
      if (name === "echo") {
        result = { content: [{ type: "text", text: `Echo: ${args.message}` }] };
      } else if (name === "add") {
        result = { content: [{ type: "text", text: `${args.a} + ${args.b} = ${args.a + args.b}` }] };
      } else if (name === "get_time") {
        result = { content: [{ type: "text", text: new Date().toISOString() }] };
      } else {
        respondError(msg.id, -32601, `Unknown tool: ${name}`);
        return;
      }
      respond(msg.id, result);
    } catch (err) {
      respondError(msg.id, -32603, err.message);
    }
  } else if (msg.id !== undefined) {
    respondError(msg.id, -32601, `Method not found: ${msg.method}`);
  }
});
