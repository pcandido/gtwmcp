// MCP Protocol Layer — JSON-RPC 2.0 encode/decode
// https://www.jsonrpc.org/specification

// ---------------------------------------------------------------------------
// Standard JSON-RPC 2.0 error codes
// ---------------------------------------------------------------------------
export const ErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
};

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

/**
 * Parse a JSON line into a message object.
 * Returns null if the line is empty or whitespace-only.
 * Throws on invalid JSON.
 *
 * @param {string} line
 * @returns {object|null}
 */
export function parseMessage(line) {
  const trimmed = line.trim();
  if (trimmed.length === 0) return null;
  return JSON.parse(trimmed);
}

// ---------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------

/**
 * Encode a message object to a JSON string terminated by a newline (for
 * stdio transport).
 *
 * @param {object} msg
 * @returns {string}
 */
export function encodeMessage(msg) {
  return JSON.stringify(msg) + "\n";
}

// ---------------------------------------------------------------------------
// Request / Notification / Response factories
// ---------------------------------------------------------------------------

/**
 * Create a JSON-RPC 2.0 request object.
 *
 * @param {string|number} id
 * @param {string} method
 * @param {object} [params]
 * @returns {{ jsonrpc: "2.0", id, method, params }}
 */
export function createRequest(id, method, params) {
  const req = { jsonrpc: "2.0", id, method };
  if (params !== undefined) req.params = params;
  return req;
}

/**
 * Create a JSON-RPC 2.0 notification (no id field).
 *
 * @param {string} method
 * @param {object} [params]
 * @returns {{ jsonrpc: "2.0", method, params }}
 */
export function createNotification(method, params) {
  const notif = { jsonrpc: "2.0", method };
  if (params !== undefined) notif.params = params;
  return notif;
}

/**
 * Create a JSON-RPC 2.0 success response.
 *
 * @param {string|number} id
 * @param {*} result
 * @returns {{ jsonrpc: "2.0", id, result }}
 */
export function createResponse(id, result) {
  return { jsonrpc: "2.0", id, result };
}

/**
 * Create a JSON-RPC 2.0 error response.
 *
 * @param {string|number} id
 * @param {number} code
 * @param {string} message
 * @param {*} [data]
 * @returns {{ jsonrpc: "2.0", id, error: { code, message, data? } }}
 */
export function createError(id, code, message, data) {
  const err = { code, message };
  if (data !== undefined) err.data = data;
  return { jsonrpc: "2.0", id, error: err };
}

// ---------------------------------------------------------------------------
// Type-checking helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the message is a JSON-RPC request (has both id and method).
 *
 * @param {object} msg
 * @returns {boolean}
 */
export function isRequest(msg) {
  return msg != null && "id" in msg && "method" in msg;
}

/**
 * Returns true if the message is a JSON-RPC notification (has method, no id).
 *
 * @param {object} msg
 * @returns {boolean}
 */
export function isNotification(msg) {
  return msg != null && "method" in msg && !("id" in msg);
}

/**
 * Returns true if the message is a JSON-RPC response (has id, no method).
 *
 * @param {object} msg
 * @returns {boolean}
 */
export function isResponse(msg) {
  return msg != null && "id" in msg && !("method" in msg);
}
