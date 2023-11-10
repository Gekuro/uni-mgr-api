"use strict";

import { Courses, Persons } from "../data/dataHandler";
import { Course } from "../types/course";
import { Person } from "../types/person";
import { getUnusedCourseUUID } from "./utils/UUID";

export default {
  getCourse: async (
    _: unknown,
    { UUID }: { UUID: string }
  ): Promise<Course | null> => {
    return await Courses.collection.findOne({ UUID: UUID });
  },

  getCourses: async (_: unknown): Promise<Course[]> => {
    const cursor = Courses.collection.find();

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
    const finalCourse: Course = {
      UUID: await getUnusedCourseUUID(),
      studentIds: [],
      ...course,
    };

    Courses.collection.insertOne(finalCourse);

    return finalCourse;
  },

  addCourses: async (
    _: unknown,
    { courses }: { courses: Omit<Omit<Course, "UUID">, "studentIds">[] }
  ): Promise<Course[]> => {
    const finalCourses: Course[] = [];
    for (const course of courses) {
      finalCourses.push({
        UUID: await getUnusedCourseUUID(),
        studentIds: [],
        ...course,
      });
    }

    Courses.collection.insertMany(finalCourses);
    return finalCourses;
  },

  updateCourse: async (
    _: unknown,
    { UUID, course }: { UUID: string; course: Partial<Omit<Course, "UUID">> }
  ): Promise<Course | null> => {
    const result = await Courses.collection.findOneAndUpdate(
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
    return await Persons.collection.findOne({ UUID: root.lecturerId });
  },

  studentsField: async (root: Course): Promise<Person[]> => {
    const students: Person[] = [];

    for (const id of root.studentIds) {
      const student = await Persons.collection.findOne({ UUID: id });

      if (student) students.push(student);
    }

    return students;
  },
};
