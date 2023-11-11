"use strict";

import fastify from "npm:fastify";
import mercurius from "npm:mercurius";
import "npm:dotenv/config";
import { GraphQLFileLoader } from "npm:@graphql-tools/graphql-file-loader";
import { loadSchema } from "npm:@graphql-tools/load";

import { connectDb } from "./data/dataHandler.ts";
import resolvers from "./resolvers/resolvers.ts";
import { readTokenIntoContext } from "./auth/auth.ts";

const app = fastify();

async function loadServer(): Promise<void> {
  await connectDb();

  const schema = await loadSchema("./schema/*.gql", {
    cwd: new URL(".", import.meta.url).pathname,
    assumeValid: true,
    loaders: [new GraphQLFileLoader()],
  });

  app.register(mercurius.default, {
    // TODO get rid of .default
    schema,
    resolvers,
    graphiql: true,
    context: readTokenIntoContext,
  });

  await app.listen({ port: parseInt(Deno.env.get("API_PORT")!) });
}

loadServer().then(() =>
  console.log(`listening @ port ${Deno.env.get("API_PORT")!}`)
);
