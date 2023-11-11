"use strict";

import { Db, MongoClient } from "npm:mongodb";

import { Course } from "../types/course.ts";
import { Person } from "../types/person.ts";
import { Account } from "../types/account.ts";
import { CollectionHandler } from "./collectionHandler.ts";

const client: MongoClient = new MongoClient(Deno.env.get("MONGO_CONN_STR")!);

// define collections here
export let Persons: CollectionHandler<Person>;
export let Courses: CollectionHandler<Course>;
export let Accounts: CollectionHandler<Account>;

let database: Db;
export async function connectDb() {
  await client.connect();

  await client.db(Deno.env.get("MONGO_DB_NAME")!).command({ ping: 1 });
  database = client.db(Deno.env.get("MONGO_DB_NAME")!);

  // initiate collections here
  Persons = new CollectionHandler<Person>(database, "persons");
  Courses = new CollectionHandler<Course>(database, "courses");
  Accounts = new CollectionHandler<Account>(database, "accounts");

  console.log("connected to Mongo deployment");
}
