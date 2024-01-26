"use strict";

import fastify from "fastify";
import cors from "@fastify/cors";
import mercurius from "mercurius";
import "dotenv/config";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";

import { isEnvValid, CorrectEnv } from "./types/validators";
import { connectDb } from "./data/dataHandler";
import resolvers from "./resolvers/resolvers";
import { readTokenIntoContext } from "./auth/auth";

isEnvValid(process.env);
const env = process.env as CorrectEnv;

const app = fastify();

async function loadServer(): Promise<void> {
  await connectDb();

  const schema = await loadSchema("./schema/*.gql", {
    cwd: __dirname,
    assumeValid: true,
    loaders: [new GraphQLFileLoader()],
  });

  if (env.CORS_ENABLED === "true") {
    console.log("CORS enabled from origin *");
    app.register(cors, { origin: env.CORS_ENABLED_ORIGIN });
  }

  app.register(mercurius, {
    schema,
    resolvers,
    graphiql: true,
    context: readTokenIntoContext,
  });

  await app.listen({ port: parseInt(env.API_PORT) });
}

loadServer().then(() => console.log(`listening @ port ${env.API_PORT}`));
