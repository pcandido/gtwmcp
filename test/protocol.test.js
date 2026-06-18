// Tests for MCP Protocol layer — JSON-RPC 2.0 encode/decode
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseMessage,
  encodeMessage,
  createRequest,
  createNotification,
  createResponse,
  createError,
  isRequest,
  isNotification,
  isResponse,
  ErrorCode,
} from "../src/mcp/protocol.js";

describe("parseMessage", () => {
  it("parses valid JSON", () => {
    const msg = parseMessage('{"jsonrpc":"2.0","id":1,"method":"test"}');
    assert.deepEqual(msg, { jsonrpc: "2.0", id: 1, method: "test" });
  });

  it("returns null for empty string", () => {
    assert.equal(parseMessage(""), null);
  });

  it("returns null for whitespace-only", () => {
    assert.equal(parseMessage("   \n  "), null);
  });

  it("throws on invalid JSON", () => {
    assert.throws(() => parseMessage("{bad json"), SyntaxError);
  });
});

describe("encodeMessage", () => {
  it("encodes to JSON string with newline", () => {
    const result = encodeMessage({ jsonrpc: "2.0", id: 1, result: "ok" });
    assert.equal(result, '{"jsonrpc":"2.0","id":1,"result":"ok"}\n');
  });
});

describe("createRequest", () => {
  it("creates a request with id, method, params", () => {
    const req = createRequest(1, "tools/list", { cursor: "abc" });
    assert.deepEqual(req, { jsonrpc: "2.0", id: 1, method: "tools/list", params: { cursor: "abc" } });
  });

  it("omits params when undefined", () => {
    const req = createRequest(2, "shutdown");
    assert.deepEqual(req, { jsonrpc: "2.0", id: 2, method: "shutdown" });
  });
});

describe("createNotification", () => {
  it("creates notification without id", () => {
    const notif = createNotification("initialized");
    assert.deepEqual(notif, { jsonrpc: "2.0", method: "initialized" });
  });

  it("includes params when provided", () => {
    const notif = createNotification("notifications/progress", { progress: 50 });
    assert.deepEqual(notif, {
      jsonrpc: "2.0",
      method: "notifications/progress",
      params: { progress: 50 },
    });
  });
});

describe("createResponse", () => {
  it("creates success response", () => {
    const resp = createResponse(1, { tools: [] });
    assert.deepEqual(resp, { jsonrpc: "2.0", id: 1, result: { tools: [] } });
  });
});

describe("createError", () => {
  it("creates error response", () => {
    const resp = createError(1, -32601, "Method not found");
    assert.deepEqual(resp, {
      jsonrpc: "2.0",
      id: 1,
      error: { code: -32601, message: "Method not found" },
    });
  });

  it("includes data when provided", () => {
    const resp = createError(1, -32602, "Invalid params", { param: "name" });
    assert.equal(resp.error.data.param, "name");
  });
});

describe("type-checking helpers", () => {
  it("isRequest detects request (has id and method)", () => {
    assert.ok(isRequest({ jsonrpc: "2.0", id: 1, method: "test" }));
  });

  it("isRequest returns false for notification", () => {
    assert.equal(isRequest({ jsonrpc: "2.0", method: "test" }), false);
  });

  it("isRequest returns false for response", () => {
    assert.equal(isRequest({ jsonrpc: "2.0", id: 1, result: "ok" }), false);
  });

  it("isNotification detects notification (method, no id)", () => {
    assert.ok(isNotification({ jsonrpc: "2.0", method: "test" }));
  });

  it("isNotification returns false for request", () => {
    assert.equal(isNotification({ jsonrpc: "2.0", id: 1, method: "test" }), false);
  });

  it("isResponse detects response (id, no method)", () => {
    assert.ok(isResponse({ jsonrpc: "2.0", id: 1, result: "ok" }));
  });

  it("isResponse returns false for request", () => {
    assert.equal(isResponse({ jsonrpc: "2.0", id: 1, method: "test" }), false);
  });
});

describe("ErrorCode", () => {
  it("has standard JSON-RPC error codes", () => {
    assert.equal(ErrorCode.PARSE_ERROR, -32700);
    assert.equal(ErrorCode.METHOD_NOT_FOUND, -32601);
    assert.equal(ErrorCode.INVALID_PARAMS, -32602);
    assert.equal(ErrorCode.INTERNAL_ERROR, -32603);
  });
});
