import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { FastifyRequest, FastifyReply } from "fastify";
import { onSendAsyncHookHandler } from "fastify/types/hooks";
import { buildCacheKey } from "../helpers/buildCacheKey";

interface CreateOnSendHookOptions {
  dynamoClient: DynamoDBClient;
  tableName: string;
  ttlSeconds: number;
  hashKey?: boolean;
  hashThresholdBytes?: number;
}

export const createOnSendHook = ({
  dynamoClient,
  tableName,
  ttlSeconds,
  hashKey,
  hashThresholdBytes,
}: CreateOnSendHookOptions) => {
  const onSendHandler: onSendAsyncHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown,
  ) => {
    if (reply.getHeader("x-cache") === "miss" && reply.statusCode === 200) {
      const { key, hashed } = buildCacheKey(request.url, {
        hashKey,
        hashThresholdBytes,
      });
      const expiration = Math.floor(new Date().getTime() / 1000) + ttlSeconds; // TTL in seconds
      const command = new PutItemCommand({
        TableName: tableName,
        Item: {
          path: { S: key },
          ttl: { N: expiration.toString() },
          data: { S: JSON.stringify(payload, undefined, 0) },
          // Keep the original URL inspectable when the key has been hashed.
          ...(hashed ? { url: { S: request.url } } : {}),
        },
      });

      try {
        await dynamoClient.send(command);
      } catch (error) {
        request.log.fatal(
          { error, url: request.url },
          "Caching new values failed.",
        );
      }
    }
  };

  return onSendHandler;
};
