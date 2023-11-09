import { FastifyPluginAsync } from "fastify";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { z } from "zod";

export const usersRoutes: FastifyPluginAsync = async function (fastify) {
  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/",
    {
      config: {
        cache: {
          cacheEnabled: true,
          ttl: 10,
        },
      },
      schema: {
        response: {
          "200": z.array(
            z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              username: z.string(),
            })
          ),
        },
      },
    },
    async (_, res) => {
      await new Promise((r) => setTimeout(r, 2000));

      return res.status(200).send([
        {
          id: "2a54c12c-7c4f-479b-a50d-6beaf3bdb9e0",
          email: "example@mail.com",
          username: "JohnDoe",
        },
        {
          id: "19b3da94-a103-4423-ba10-860c9a68e572",
          email: "example@mail.com",
          username: "JaneDoe",
        },
      ]);
    }
  );

  app.get(
    "/:id",
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          "200": z.object({
            id: z.string().uuid(),
            email: z.string().email(),
            username: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      return res.status(200).send({
        id: req.params.id,
        email: "example@mail.com",
        username: "JohnDoe",
      });
    }
  );
};
