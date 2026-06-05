import {
  buildCacheKey,
  HASHED_KEY_PREFIX,
  DEFAULT_HASH_THRESHOLD_BYTES,
} from "./buildCacheKey";

describe("buildCacheKey", () => {
  it("should return the raw URL unchanged for a short URL with no flag", () => {
    const url = "/users/123?filter=active";
    expect(buildCacheKey(url)).toEqual({ key: url, hashed: false });
  });

  it("should hash the key when hashKey is true", () => {
    const url = "/users/123";
    const result = buildCacheKey(url, { hashKey: true });
    expect(result.hashed).toBe(true);
    expect(result.key.startsWith(HASHED_KEY_PREFIX)).toBe(true);
    expect(result.key).not.toContain(url);
  });

  it("should auto-hash a URL longer than the threshold even without the flag", () => {
    const url = "/search?q=" + "a".repeat(DEFAULT_HASH_THRESHOLD_BYTES);
    const result = buildCacheKey(url);
    expect(result.hashed).toBe(true);
    expect(result.key.startsWith(HASHED_KEY_PREFIX)).toBe(true);
  });

  it("should not hash a URL at or under the threshold", () => {
    const url = "/x".repeat(10);
    expect(buildCacheKey(url, { hashThresholdBytes: url.length }).hashed).toBe(
      false
    );
  });

  it("should produce the same key for the same URL", () => {
    const url = "/users/123?filter=active";
    expect(buildCacheKey(url, { hashKey: true })).toEqual(
      buildCacheKey(url, { hashKey: true })
    );
  });

  it("should produce different keys for different URLs", () => {
    const a = buildCacheKey("/users/1", { hashKey: true });
    const b = buildCacheKey("/users/2", { hashKey: true });
    expect(a.key).not.toBe(b.key);
  });

  it("should honor a custom hashThresholdBytes", () => {
    const url = "/abcdef";
    expect(buildCacheKey(url, { hashThresholdBytes: 3 }).hashed).toBe(true);
    expect(buildCacheKey(url, { hashThresholdBytes: 100 }).hashed).toBe(false);
  });
});
