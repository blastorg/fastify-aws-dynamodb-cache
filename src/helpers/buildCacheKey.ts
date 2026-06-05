import { createHash } from "node:crypto";

/**
 * Prefix applied to hashed cache keys so they are distinguishable from raw
 * URL keys (which always start with "/") when inspecting the table.
 */
export const HASHED_KEY_PREFIX = "sha256:";

/**
 * Default byte size at which a cache key is hashed automatically. Matches
 * DynamoDB's maximum partition (hash) key size of 2048 bytes.
 */
export const DEFAULT_HASH_THRESHOLD_BYTES = 2048;

interface BuildCacheKeyOptions {
  /**
   * Force hashing of the key regardless of its size.
   */
  hashKey?: boolean;
  /**
   * Byte size above which the key is hashed automatically. Defaults to
   * {@link DEFAULT_HASH_THRESHOLD_BYTES}.
   */
  hashThresholdBytes?: number;
}

/**
 * Builds the DynamoDB partition key for a request URL.
 *
 * The key is hashed when `hashKey` is true, or automatically when the URL
 * exceeds `hashThresholdBytes` (a safety net against DynamoDB's 2048-byte hash
 * key limit). Otherwise the raw URL is used.
 *
 * @param url - The request URL (path + query string).
 * @param options - Hashing options.
 * @returns The cache key and whether it was hashed.
 */
export const buildCacheKey = (
  url: string,
  {
    hashKey,
    hashThresholdBytes = DEFAULT_HASH_THRESHOLD_BYTES,
  }: BuildCacheKeyOptions = {},
): { key: string; hashed: boolean } => {
  const shouldHash =
    hashKey === true || Buffer.byteLength(url, "utf8") > hashThresholdBytes;

  if (!shouldHash) {
    return { key: url, hashed: false };
  }

  const digest = createHash("sha256").update(url).digest("hex");
  return { key: `${HASHED_KEY_PREFIX}${digest}`, hashed: true };
};
