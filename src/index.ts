import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createOnRequestHook } from "./hooks/onRequest";
import { createOnSendHook } from "./hooks/onSend";

/**
 * Plugin options for fastify-aws-dynamodb-cache.
 *
 * @property {string} dynamoDbRegion - AWS region for DynamoDB client configuration.
 * @property {string} [dynamoDbAddress] - Optional custom endpoint (useful for local development/testing).
 * @property {string} tableName - DynamoDB table name used for storing cache entries.
 * @property {number} defaultTTLSeconds - Global default TTL (in seconds) for all cache entries.
 * @property {boolean} [disableCache=false] - If true, disables caching plugin-wide.
 * @property {string} [passthroughQueryParam] - If defined, this query parameter will bypass cache when present in a request.
 */
export interface DynamodbCachePluginOptions {
  dynamoDbRegion: string;
  dynamoDbAddress?: string;
  tableName: string;
  defaultTTLSeconds: number;
  disableCache?: boolean;
  passthroughQueryParam?: string;
}

/**
 * Fastify plugin for caching responses in DynamoDB.
 *
 * Adds support for per-route caching via a shared DynamoDB table.
 *
 * Use route-level `config.cache` to control TTL and caching behavior:
 *
 * @example
 * ```ts
 * fastify.get('/my-route', {
 *   config: {
 *     cache: {
 *       cacheEnabled: true,
 *       ttlSeconds: 120
 *     }
 *   }
 * }, async (req, reply) => {
 *   return { hello: 'world' };
 * });
 * ```
 *
 * @param fastify - Fastify instance
 * @param opts - Plugin options for DynamoDB caching
 */
export const dynamodbCache: FastifyPluginAsync<DynamodbCachePluginOptions> = (
  fastify,
  opts
) => {
  const dynamoClient = new DynamoDBClient({
    endpoint: opts.dynamoDbAddress,
    region: opts.dynamoDbRegion,
  });

  fastify.addHook("onRoute", (routeOptions) => {
    if (
      !opts.disableCache && // Only add cache to route if plugin setting "disableCache" is false or undefined
      routeOptions.config && // Check if route config object is set
      routeOptions.config.cache && // Check if route config cache object is set
      routeOptions.config.cache.cacheEnabled === true // Check if cache object contains "cacheEnabled" property and that is true
    ) {
      const onRequestHook = createOnRequestHook({
        dynamoClient,
        tableName: opts.tableName,
        passthroughQueryParam: opts.passthroughQueryParam,
      });

      const onSendHook = createOnSendHook({
        dynamoClient,
        tableName: opts.tableName,
        ttlSeconds:
          routeOptions.config.cache.ttlSeconds || opts.defaultTTLSeconds, // Defaults to "defaultTTLSeconds" which is specified when registering the plugin
      });

      if (Array.isArray(routeOptions.onRequest)) {
        routeOptions.onRequest = [
          ...(routeOptions.onRequest || []),
          onRequestHook,
        ];
      } else {
        routeOptions.onRequest = [onRequestHook];
      }

      if (Array.isArray(routeOptions.onSend)) {
        routeOptions.onSend = [...(routeOptions.onSend || []), onSendHook];
      } else {
        routeOptions.onSend = [onSendHook];
      }
    }
  });

  return Promise.resolve();
};

declare module "fastify" {
  interface FastifyContextConfig {
    /**
     * Route-specific cache configuration.
     */
    cache?: {
      /**
       * Enable or disable cache for this route. Defaults to false.
       */
      cacheEnabled?: boolean;
      /**
       * TTL in seconds for the cached response. Overrides global defaultTTLSeconds if set.
       */
      ttlSeconds?: number;
    };
  }
}

export default fastifyPlugin(dynamodbCache, {
  fastify: "5.x",
  name: "fastify-aws-dynamodb-cache",
});
