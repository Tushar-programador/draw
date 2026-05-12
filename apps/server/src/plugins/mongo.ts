import { MongoClient, type Db } from "mongodb";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    mongo: Db;
  }
}

const mongoPlugin: FastifyPluginAsync = fp(async (app) => {
  const uri = process.env["MONGODB_URI"];
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  app.decorate("mongo", db);

  app.addHook("onClose", async () => {
    await client.close();
  });

  app.log.info("MongoDB connected");
});

export default mongoPlugin;
