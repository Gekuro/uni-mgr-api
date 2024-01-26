"use strict";

import { Store } from "../data/store";
import { Course } from "../types/course";
import { Person, PersonType } from "../types/person";
import { getUnusedPersonUUID } from "./utils/UUID";

export default {
  getPerson: async (
    _: unknown,
    { UUID }: { UUID: string }
  ): Promise<Person | null> => {
    const store = Store.getStore();
    return await store.persons.findOne({ UUID: UUID });
  },

  getPersons: async (
    _: unknown,
    params: { name?: string; surname?: string; type?: PersonType }
  ): Promise<Person[]> => {
    const store = Store.getStore();
    const cursor = store.persons.find(params);

    const persons: Person[] = [];
    for await (const person of cursor) {
      persons.push(person);
    }

    return persons;
  },

  addPerson: async (
    _: unknown,
    { person }: { person: Omit<Person, "UUID"> }
  ): Promise<Person> => {
    const store = Store.getStore();
    const finalPerson: Person = {
      UUID: await getUnusedPersonUUID(),
      ...person,
    };

    store.persons.insertOne(finalPerson); // TODO should these be awaited?
    return finalPerson;
  },

  addPersons: async (
    _: unknown,
    { persons }: { persons: Omit<Person, "UUID">[] }
  ): Promise<Person[]> => {
    const store = Store.getStore();
    const finalPersons: Person[] = [];
    for (const person of persons) {
      finalPersons.push({
        UUID: await getUnusedPersonUUID(),
        ...person,
      });
    }

    store.persons.insertMany(finalPersons);
    return finalPersons;
  },

  updatePerson: async (
    _: unknown,
    { UUID, person }: { UUID: string; person: Partial<Omit<Person, "UUID">> }
  ): Promise<Person | null> => {
    const store = Store.getStore();
    const result = await store.persons.findOneAndUpdate(
      { UUID: UUID },
      {
        $set: {
          ...person,
        },
      },
      {
        returnDocument: "after",
      }
    );

    return result;
  },

  attendingField: async (root: Person): Promise<Course[]> => {
    const store = Store.getStore();
    const cursor = store.courses.find({ studentIds: root.UUID });

    const courses: Course[] = [];
    for await (const course of cursor) {
      courses.push(course);
    }

    return courses;
  },

  lecturingField: async (root: Person): Promise<Course[]> => {
    const store = Store.getStore();
    const cursor = store.courses.find({ lecturerId: root.UUID });

    const courses: Course[] = [];
    for await (const course of cursor) {
      courses.push(course);
    }

    return courses;
  },
};
