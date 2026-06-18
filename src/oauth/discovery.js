// OAuth server metadata discovery via .well-known endpoints

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

/**
 * @typedef {Object} OAuthMetadata
 * @property {string} authorization_url
 * @property {string} token_url
 * @property {string[]} [scopes_supported]
 * @property {string} [registration_endpoint]
 */

/**
 * Discover OAuth server metadata from a server URL.
 * Best-effort — returns null on any failure.
 *
 * @param {string} serverUrl - The MCP server URL (e.g. https://example.com/mcp)
 * @returns {Promise<OAuthMetadata|null>}
 */
export async function discoverOAuthMetadata(serverUrl) {
  try {
    const origin = getOrigin(serverUrl);
    if (!origin) return null;

    // Step 3: GET /.well-known/oauth-protected-resource
    const protectedResource = await fetchJSON(`${origin}/.well-known/oauth-protected-resource`);
    if (!protectedResource) return null;

    const authServer = protectedResource.authorization_server;
    if (!authServer) return null;

    // Step 5: GET authorization_server/.well-known/oauth-authorization-server
    // authServer may be a full URL or a relative path — resolve against origin if needed
    const authServerUrl = resolveUrl(authServer, origin);
    const authMetadata = await fetchJSON(`${authServerUrl}/.well-known/oauth-authorization-server`);
    if (!authMetadata) return null;

    // Step 6: Extract relevant fields
    /** @type {OAuthMetadata} */
    const result = {
      authorization_url: authMetadata.authorization_endpoint,
      token_url: authMetadata.token_endpoint,
    };

    if (authMetadata.scopes_supported) {
      result.scopes_supported = authMetadata.scopes_supported;
    }
    if (authMetadata.registration_endpoint) {
      result.registration_endpoint = authMetadata.registration_endpoint;
    }

    // Validate required fields
    if (!result.authorization_url || !result.token_url) return null;

    return result;
  } catch {
    // Step 7: any failure → null
    return null;
  }
}

/**
 * Extract origin (scheme + host + port) from a URL string.
 */
function getOrigin(urlString) {
  try {
    const u = new URL(urlString);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/**
 * Resolve a potentially-relative URL against an origin base.
 */
function resolveUrl(candidate, base) {
  try {
    return new URL(candidate, base).origin;
  } catch {
    return candidate;
  }
}

/**
 * Fetch and parse JSON from a URL. Returns null on any failure.
 */
function fetchJSON(url) {
  return new Promise((resolve) => {
    const transport = url.startsWith('https:') ? https : http;

    const req = transport.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        req.destroy();
        return resolve(null);
      }

      /** @type {Buffer[]} */
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve(JSON.parse(body));
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}
