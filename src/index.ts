import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createOnRequestHook } from "./hooks/onRequest";
import { createOnSendHook } from "./hooks/onSend";

export interface PluginOptions {
  dynamoDbRegion: string;
  dynamoDbAddress?: string;
  tableName: string;
  defaultTTLSeconds: number;
  disableCache?: boolean;
}

export const dynamodbCache: FastifyPluginAsync<PluginOptions> = async (
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
      });

      const onSendHook = createOnSendHook({
        dynamoClient,
        tableName: opts.tableName,
        ttlSeconds:
          routeOptions.config.cache.ttlSeconds || opts.defaultTTLSeconds, // Defaults to "defaultTTLSeconds" which is specified when registering the plugin
      });

      if (!routeOptions.onRequest) {
        routeOptions.onRequest = [onRequestHook];
      }
      if (!routeOptions.onSend) {
        routeOptions.onSend = [onSendHook];
      }

      if (Array.isArray(routeOptions.onRequest)) {
        routeOptions.onRequest.push(onRequestHook);
      } else {
        routeOptions.onRequest = [routeOptions.onRequest, onRequestHook];
      }

      if (Array.isArray(routeOptions.onSend)) {
        routeOptions.onSend.push(onSendHook);
      } else {
        routeOptions.onSend = [routeOptions.onSend, onSendHook];
      }
    }
  });
};

declare module "fastify" {
  interface FastifyContextConfig {
    cache?: {
      cacheEnabled?: boolean;
      ttlSeconds?: number;
    };
  }
}

export default fastifyPlugin(dynamodbCache, {
  fastify: "4.x",
  name: "fastify-aws-dynamodb-cache",
});
