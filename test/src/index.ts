import Fastify from "fastify";
import routes from "./routes";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { dynamodbCache } from "@blastorg/fastify-aws-dynamodb-cache";

const fastify = Fastify({
  logger: true,
});

fastify
  .register(dynamodbCache, {
    dynamoDbRegion: "eu-central-1",
    tableName: "fastify-dynamodb-cache",
    dynamoDbAddress: "http://localhost:8000",
  })
  .register(fastifySwagger, {
    openapi: {
      info: {
        title: "SampleApi",
        description: "Sample backend service",
        version: "1.0.0",
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  })
  .register(fastifySwaggerUi, {
    routePrefix: "/docs",
  })
  .register(routes, { prefix: "/v1" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err: Error | null) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

process.on("SIGINT", () => {
  fastify.log.warn(`SIGINT signal detected, terminating service`);
  fastify.close();
});

process.on("SIGTERM", () => {
  fastify.log.warn(`SIGTERM signal detected, terminating service`);
  fastify.close();
});
