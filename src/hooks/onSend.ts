import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { onSendHookHandler, FastifyRequest, FastifyReply } from "fastify";

interface CreateOnSendHookOptions {
  dynamoClient: DynamoDBClient;
  tableName: string;
}

export const createOnSendHook = ({
  dynamoClient,
  tableName,
}: CreateOnSendHookOptions) => {
  const onSendHandler: onSendHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown
  ) => {
    if (reply.getHeader("x-cache") === "miss") {
      const ttl = new Date().getTime() + 300000;
      const command = new PutItemCommand({
        TableName: tableName,
        Item: {
          path: { S: request.url },
          ttl: { N: ttl.toString() },
          data: { S: JSON.stringify(payload, undefined, 0) },
        },
      });

      try {
        await dynamoClient.send(command);
      } catch (error) {
        request.log.fatal(error, "Caching new values failed.");
      }
    }
    return;
  };

  return onSendHandler;
};
