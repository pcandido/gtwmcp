// Tests for PKCE utilities
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "../src/oauth/pkce.js";

describe("generateCodeVerifier", () => {
  it("returns a 43-character base64url string", () => {
    const verifier = generateCodeVerifier();
    assert.equal(verifier.length, 43);
    // Must only contain base64url chars
    assert.match(verifier, /^[A-Za-z0-9_-]+$/);
  });

  it("returns different values on each call", () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    assert.notEqual(a, b);
  });
});

describe("generateCodeChallenge", () => {
  it("produces the correct S256 challenge", () => {
    const verifier = "test-verifier-value-12345678901234567";
    const challenge = generateCodeChallenge(verifier);

    // Verify manually
    const expected = createHash("sha256")
      .update(verifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    assert.equal(challenge, expected);
  });

  it("has no padding", () => {
    const challenge = generateCodeChallenge(generateCodeVerifier());
    assert.equal(challenge.endsWith("="), false);
  });
});

describe("generateState", () => {
  it("returns a random string", () => {
    const state = generateState();
    assert.ok(state.length > 0);
    assert.match(state, /^[A-Za-z0-9_-]+$/);
  });

  it("returns different values", () => {
    assert.notEqual(generateState(), generateState());
  });
});
