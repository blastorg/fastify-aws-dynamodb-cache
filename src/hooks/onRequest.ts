import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { FastifyRequest, FastifyReply } from "fastify";
import { onRequestAsyncHookHandler } from "fastify/types/hooks";

interface CreateOnRequestHookOptions {
  dynamoClient: DynamoDBClient;
  tableName: string;
}

export const createOnRequestHook = ({
  dynamoClient,
  tableName,
}: CreateOnRequestHookOptions) => {
  const onRequestHook: onRequestAsyncHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const command = new GetItemCommand({
      TableName: tableName,
      Key: {
        path: { S: request.url },
      },
    });

    try {
      const { Item } = await dynamoClient.send(command);

      if (Item) {
        if (
          parseInt(Item["ttl"].N || "0") >
          Math.floor(new Date().getTime() / 1000)
        ) {
          reply.header("x-cache", Item["ttl"].N || 0);
          reply.header("content-type", "application/json");
          return reply.status(200).send(JSON.parse(Item["data"].S || "{}"));
        } else {
          reply.header("x-cache", "miss");
        }
      } else {
        reply.header("x-cache", "miss");
      }
    } catch (error) {
      request.log.error(error, "Cache query error");
      reply.header("x-cache", "miss");
    }
  };

  return onRequestHook;
};
