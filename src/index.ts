import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createOnRequestHook } from "./hooks/onRequest";
import { createOnSendHook } from "./hooks/onSend";

export interface PluginOptions {
  dynamoDbRegion: string;
  dynamoDbAddress?: string;
  tableName: string;
  defaultTTL: number;
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
    if (routeOptions.config && routeOptions.config.cacheEnabled === true) {
      const onRequestHook = createOnRequestHook({
        dynamoClient,
        tableName: opts.tableName,
      });

      const onSendHook = createOnSendHook({
        dynamoClient,
        tableName: opts.tableName,
        ttlSeconds: routeOptions.config.ttl || opts.defaultTTL, // Defaults to "defaultTTL" which is specified when registering the plugin
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
    cacheEnabled?: boolean;
    ttl?: number;
  }
}

export default fastifyPlugin(dynamodbCache, {
  fastify: "4.x",
  name: "fastify-aws-dynamodb-cache",
});
