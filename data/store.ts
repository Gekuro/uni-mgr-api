"use strict";

import { Collection, Db, MongoClient } from "mongodb";
import { CorrectEnv } from "../types/validators";
import { Course } from "../types/course";
import { Person } from "../types/person";
import { Account } from "../types/account";
import { Grade } from "../types/grade";
import { Activity } from "../types/activity";

const env = process.env as unknown as CorrectEnv; // vaildated in main.ts
let mongoDb: Db | undefined;

export async function connectDb() {
  let mongoClient = new MongoClient(env.MONGO_CONN_STR);
  await mongoClient.connect();

  await mongoClient.db(env.MONGO_DB_NAME).command({ ping: 1 });
  mongoDb = mongoClient.db(env.MONGO_DB_NAME);

  console.log("connected to MongoDB instance");
}

export class Store {
  private static instance: Store | undefined;

  public persons: Collection<Person>;
  public courses: Collection<Course>;
  public accounts: Collection<Account>;
  public grades: Collection<Grade>;
  public activities: Collection<Activity>;

  private db: Db;

  private constructor(db: Db | undefined) {
    if (!db)
      throw new Error(
        "Store singleton is used before db connection was established"
      );
    this.db = db;
    this.persons = this.db.collection<Person>("persons");
    this.courses = this.db.collection<Course>("courses");
    this.accounts = this.db.collection<Account>("accounts");
    this.grades = this.db.collection<Grade>("grades");
    this.activities = this.db.collection<Activity>("activites");
  }

  public static getStore() {
    if (!this.instance) {
      this.instance = new Store(mongoDb);
    }
    return this.instance;
  }
}
