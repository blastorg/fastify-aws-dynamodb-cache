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
  const onSendHandler: onSendHookHandler = (
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown,
    done
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

      dynamoClient
        .send(command)
        .then(() => {
          done();
        })
        .catch((err) => {
          request.log.fatal(err, "Caching new values failed.");
          done();
        });
    }

    done();
  };

  return onSendHandler;
};
