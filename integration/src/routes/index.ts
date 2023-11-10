import { FastifyPluginAsync } from "fastify";
import { usersRoutes } from "./users";

const routes: FastifyPluginAsync = async (instance) => {
  instance.register(usersRoutes, { prefix: "/users" });
};

export default routes;
