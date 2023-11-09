import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { FastifyPluginCallback } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createOnRequestHook } from "./hooks/onRequest";
import { createOnSendHook } from "./hooks/onSend";

export interface PluginOptions {
  dynamoDbRegion: string;
  tableName: string;
  dynamoDbAddress?: string;
}

export const dynamodbCache: FastifyPluginCallback<PluginOptions> = (
  fastify,
  opts,
  done
) => {
  const dynamoClient = new DynamoDBClient({
    endpoint: opts.dynamoDbAddress,
    region: opts.dynamoDbRegion,
  });

  const onRequestHook = createOnRequestHook({
    dynamoClient,
    tableName: opts.tableName,
  });

  const onSendHook = createOnSendHook({
    dynamoClient,
    tableName: opts.tableName,
  });

  fastify.decorate("cache", { enabled: false });

  fastify.addHook("onRoute", (routeOptions) => {
    if (routeOptions.config && routeOptions.config.cacheEnabled === true) {
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

  done();
};

declare module "fastify" {
  interface FastifyContextConfig {
    cacheEnabled?: boolean;
  }
}

export default fastifyPlugin(dynamodbCache, {
  fastify: "4.x",
  name: "fastify-aws-dynamodb-cache",
});
