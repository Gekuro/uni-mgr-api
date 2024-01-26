"use strict";

import { Store } from "../data/store";
import { Course } from "../types/course";
import { Person } from "../types/person";
import { getUnusedCourseUUID } from "./utils/UUID";

export default {
  getCourse: async (
    _: unknown,
    { UUID }: { UUID: string }
  ): Promise<Course | null> => {
    const store = Store.getStore();
    return await store.courses.findOne({ UUID: UUID });
  },

  getCourses: async (_: unknown): Promise<Course[]> => {
    const store = Store.getStore();
    const cursor = store.courses.find();

    const courses: Course[] = [];
    for await (const course of cursor) {
      courses.push(course);
    }

    return courses;
  },

  addCourse: async (
    _: unknown,
    { course }: { course: Omit<Omit<Course, "UUID">, "studentIds"> }
  ): Promise<Course> => {
    const store = Store.getStore();
    const finalCourse: Course = {
      UUID: await getUnusedCourseUUID(),
      studentIds: [],
      ...course,
    };

    store.courses.insertOne(finalCourse);

    return finalCourse;
  },

  addCourses: async (
    _: unknown,
    { courses }: { courses: Omit<Omit<Course, "UUID">, "studentIds">[] }
  ): Promise<Course[]> => {
    const store = Store.getStore();
    const finalCourses: Course[] = [];
    for (const course of courses) {
      finalCourses.push({
        UUID: await getUnusedCourseUUID(),
        studentIds: [],
        ...course,
      });
    }

    store.courses.insertMany(finalCourses);
    return finalCourses;
  },

  updateCourse: async (
    _: unknown,
    { UUID, course }: { UUID: string; course: Partial<Omit<Course, "UUID">> }
  ): Promise<Course | null> => {
    const store = Store.getStore();
    const result = await store.courses.findOneAndUpdate(
      { UUID: UUID },
      {
        $set: {
          ...course,
        },
      },
      {
        returnDocument: "after",
      }
    );

    return result;
  },

  lecturerField: async (root: Course): Promise<Person | null> => {
    const store = Store.getStore();
    return await store.persons.findOne({ UUID: root.lecturerId });
  },

  studentsField: async (root: Course): Promise<Person[]> => {
    const store = Store.getStore();
    const students: Person[] = [];

    for (const id of root.studentIds) {
      const student = await store.persons.findOne({ UUID: id });

      if (student) students.push(student);
    }

    return students;
  },
};
