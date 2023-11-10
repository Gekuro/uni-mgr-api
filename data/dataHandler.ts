"use strict";

import { Db, MongoClient } from "mongodb";
import { isEnvValid, CorrectEnv } from "../types/validators";
import { Course } from "../types/course";
import { Person } from "../types/person";
import { Account } from "../types/account";
import { CollectionHandler } from "./collectionHandler";

const env = process.env as unknown as CorrectEnv; // vaildated in main.ts
const client: MongoClient = new MongoClient(env.MONGO_CONN_STR);

// define collections here
export let Persons: CollectionHandler<Person>;
export let Courses: CollectionHandler<Course>;
export let Accounts: CollectionHandler<Account>;

let database: Db;
export async function connectDb() {
  await client.connect();

  await client.db(env.MONGO_DB_NAME).command({ ping: 1 });
  database = client.db(env.MONGO_DB_NAME);

  // initiate collections here
  Persons = new CollectionHandler<Person>(database, "persons");
  Courses = new CollectionHandler<Course>(database, "courses");
  Accounts = new CollectionHandler<Account>(database, "accounts");

  console.log("connected to Mongo deployment");
}
