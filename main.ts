"use strict";

import fastify from "fastify";
import mercurius from "mercurius";
import "dotenv/config";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";

import { isEnvValid, CorrectEnv } from "./types/validators";
import { connectDb } from "./data/dataHandler";
import resolvers from "./resolvers/resolvers";

isEnvValid(process.env);
const env = process.env as CorrectEnv;

const app = fastify();

async function loadServer(): Promise<void> {
  connectDb();

  const schema = await loadSchema("./schema/*.gql", {
    cwd: __dirname,
    assumeValid: true,
    loaders: [new GraphQLFileLoader()],
  });

  app.register(mercurius, {
    schema,
    resolvers,
    graphiql: true,
  });

  app.listen({ port: parseInt(env.API_PORT) });

  console.log(`listening @ port ${process.env.API_PORT}`);
}

loadServer();
