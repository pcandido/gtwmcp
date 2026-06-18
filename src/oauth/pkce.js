// PKCE (Proof Key for Code Exchange) — RFC 7636 helpers

import { randomBytes, createHash } from 'node:crypto';

/**
 * Generate a cryptographically random code_verifier.
 * 43–128 chars, base64url alphabet.
 */
export function generateCodeVerifier() {
  // 32 bytes → 43 base64url characters
  const bytes = randomBytes(32);
  return base64url(bytes);
}

/**
 * Derive the S256 code_challenge from a code_verifier.
 */
export function generateCodeChallenge(verifier) {
  const hash = createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

/**
 * Generate a random state parameter for CSRF protection.
 */
export function generateState() {
  return base64url(randomBytes(32));
}

/**
 * Encode a buffer as base64url (no padding).
 */
function base64url(buf) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
