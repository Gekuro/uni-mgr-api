import { Persons, Courses } from "../data/dataHandler";
import { Course } from "../types/course";
import { Person, PersonType } from "../types/person";
import { getRandomUUID } from "./utils/getRandomId";

export default {
  getPerson: async (
    _: unknown,
    { UUID }: { UUID: string }
  ): Promise<Person | null> => {
    return await Persons.collection.findOne({ UUID: UUID });
  },

  getPersons: async (
    _: unknown,
    params: { name?: string; surname?: string; type?: PersonType }
  ): Promise<Person[]> => {
    const cursor = Persons.collection.find(params);

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
    const finalPerson: Person = {
      UUID: getRandomUUID(6),
      ...person,
    };
    Persons.collection.insertOne(finalPerson);

    return finalPerson;
  },

  addPersons: async (
    _: unknown,
    { persons }: { persons: Omit<Person, "UUID">[] }
  ): Promise<Person[]> => {
    const finalPersons: Person[] = persons.map((person) => ({
      UUID: getRandomUUID(6),
      ...person,
    }));
    Persons.collection.insertMany(finalPersons);

    return finalPersons;
  },

  updatePerson: async (
    _: unknown,
    { UUID, person }: { UUID: string; person: Partial<Omit<Person, "UUID">> }
  ): Promise<Person | null> => {
    const result = await Persons.collection.findOneAndUpdate(
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
    const cursor = Courses.collection.find({ studentIds: root.UUID });

    const courses: Course[] = [];
    for await (const course of cursor) {
      courses.push(course);
    }

    return courses;
  },

  lecturingField: async (root: Person): Promise<Course[]> => {
    const cursor = Courses.collection.find({ lecturerId: root.UUID });

    const courses: Course[] = [];
    for await (const course of cursor) {
      courses.push(course);
    }

    return courses;
  },
};
