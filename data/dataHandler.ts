import { Db, MongoClient } from "mongodb";
import { isEnvValid, CorrectEnv } from "../types/validators";
import { Course } from "../types/course";
import { Person } from "../types/person";
import { CollectionHandler } from "./collectionHandler";

isEnvValid(process.env);
const env = process.env as CorrectEnv;
const client: MongoClient = new MongoClient(env.MONGO_CONN_STR);

// define collections here
export let Persons: CollectionHandler<Person>;
export let Courses: CollectionHandler<Course>;

let database: Db;
export async function connectDb() {
  await client.connect();

  await client.db(env.MONGO_DB_NAME).command({ ping: 1 });
  database = client.db(env.MONGO_DB_NAME);

  // initiate collections here
  Persons = new CollectionHandler<Person>(database, "persons");
  Courses = new CollectionHandler<Course>(database, "courses");

  console.log("connected to Mongo deployment");
}
