import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { FastifyRequest, FastifyReply } from "fastify";
import { onSendAsyncHookHandler } from "fastify/types/hooks";

interface CreateOnSendHookOptions {
  dynamoClient: DynamoDBClient;
  tableName: string;
  ttlSeconds: number;
}

export const createOnSendHook = ({
  dynamoClient,
  tableName,
  ttlSeconds,
}: CreateOnSendHookOptions) => {
  const onSendHandler: onSendAsyncHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown
  ) => {
    if (reply.getHeader("x-cache") === "miss" && reply.statusCode === 200) {
      const expiration = Math.floor(new Date().getTime() / 1000) + ttlSeconds; // TTL in seconds
      const command = new PutItemCommand({
        TableName: tableName,
        Item: {
          path: { S: request.url },
          ttl: { N: expiration.toString() },
          data: { S: JSON.stringify(payload, undefined, 0) },
        },
      });

      try {
        await dynamoClient.send(command);
      } catch (error) {
        request.log.fatal(error, "Caching new values failed.");
      }
    }
  };

  return onSendHandler;
};
