import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { onRequestHookHandler, FastifyRequest, FastifyReply } from "fastify";

interface CreateOnRequestHookOptions {
  dynamoClient: DynamoDBClient;
  tableName: string;
}

export const createOnRequestHook = ({
  dynamoClient,
  tableName,
}: CreateOnRequestHookOptions) => {
  const onRequestHook: onRequestHookHandler = (
    request: FastifyRequest,
    reply: FastifyReply,
    done
  ) => {
    const command = new GetItemCommand({
      TableName: tableName,
      Key: {
        path: { S: request.url },
      },
    });

    dynamoClient
      .send(command)
      .then(({ Item }) => {
        if (Item) {
          if (parseInt(Item["ttl"].N || "0") > new Date().getTime()) {
            void reply.header("x-cache", Item["ttl"].N || 0);
            void reply.header("content-type", "application/json");
            void reply.status(200).send(JSON.parse(Item["data"].S || "{}"));
            done();
          }
          void reply.header("x-cache", "miss");
          done();
        } else {
          void reply.header("x-cache", "miss");
          done();
        }
      })
      .catch((error) => {
        request.log.fatal(error, "Cache query error");
        void reply.header("x-cache", "miss");
        done();
      });
  };

  return onRequestHook;
};
