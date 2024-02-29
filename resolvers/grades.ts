"use strict";

import { Filter } from "mongodb";
import { Store } from "../data/store";
import { Grade, GradeInput } from "../types/grade";
import { isGradeInputArrayValid, isGradeInputValid } from "../types/validators";
import { Person } from "../types/person";
import { Activity } from "../types/activity";

const invalidGrade = "Non-final grades need to have a name";
const gradeExistsMsg = "Set student already has this grade";
const activityDoesntExistMsg = "Cannot set grade for non-existent activity";
const studentFinalGradeExistsMsg =
  "Student already has final grade for this course";

const concatGradeDetails = (grade: GradeInput | Grade, msg: string): string =>
  msg +
  `. Grade: Student: ${grade.studentId}, Course: ${grade.courseId}, ${
    grade.final ? "Final grade." : `Name: ${grade.name}`
  }`;

const assertGradeDoesntExist = async (grade: Grade) => {
  const store = Store.getStore();
  const existingGrade = await store.grades.findOne({
    studentId: grade.studentId,
    courseId: grade.courseId,
    final: grade.final,
    ...(!grade.final && { name: grade.name }),
  });

  if (!existingGrade) return;
  if (grade.name) throw new Error(concatGradeDetails(grade, gradeExistsMsg));
  throw new Error(concatGradeDetails(grade, studentFinalGradeExistsMsg));
};

export default {
  getGrades: async (
    _: unknown,
    {
      courseId,
      studentId,
      final,
      name,
    }: { courseId?: string; studentId?: string; final?: boolean; name?: string }
  ): Promise<Grade[]> => {
    const store = Store.getStore();
    const filter: Filter<Grade> = {
      ...(courseId && { courseId }),
      ...(studentId && { studentId }),
      ...(final && { final }),
      ...(name && { name }),
    };
    const cursor = store.grades.find(filter);

    const grades: Grade[] = [];
    for await (const grade of cursor) {
      grades.push(grade);
    }

    return grades;
  },

  addGrade: async (
    _: unknown,
    { grade }: { grade: GradeInput }
  ): Promise<Grade> => {
    const store = Store.getStore();
    if (!isGradeInputValid(grade)) throw new Error(invalidGrade);
    const delayedAssertion = assertGradeDoesntExist(grade);

    if (grade.final && grade.name) delete grade.name;

    const activity = await store.activities.findOne({
      courseId: grade.courseId,
      name: grade.name,
    });
    if (!activity)
      throw new Error(concatGradeDetails(grade, activityDoesntExistMsg));

    await delayedAssertion;

    store.grades.insertOne(grade);
    return grade;
  },

  addGrades: async (
    _: unknown,
    { grades }: { grades: GradeInput[] }
  ): Promise<Grade[]> => {
    const store = Store.getStore();
    if (!isGradeInputArrayValid(grades)) {
      throw new Error(invalidGrade);
    }

    const delayedAssertions: Promise<void>[] = [];
    for (const grade of grades) {
      delayedAssertions.push(assertGradeDoesntExist(grade));
      if (grade.final && grade.name) delete grade.name;
    }

    for (const grade of grades) {
      const activity = await store.activities.findOne({
        courseId: grade.courseId,
        studentId: grade.studentId,
        final: grade.final,
        ...(!grade.final && { name: grade.name }),
      });

      if (!activity)
        throw new Error(concatGradeDetails(grade, activityDoesntExistMsg));
    }

    await Promise.all(delayedAssertions);

    store.grades.insertMany(grades);
    return grades;
  },

  updateGrade: async (
    _: unknown,
    { grade }: { grade: GradeInput }
  ): Promise<Grade | null> => {
    const store = Store.getStore();
    if (!isGradeInputValid(grade)) throw new Error(invalidGrade);

    const result = await store.grades.findOneAndUpdate(
      {
        studentId: grade.studentId,
        courseId: grade.courseId,
        final: grade.final ?? false,
        ...(grade.final && { name: grade.name }),
      },
      {
        $set: {
          points: grade.points,
        },
      },
      {
        returnDocument: "after",
      }
    );

    return result;
  },

  studentField: async (root: Grade): Promise<Person | null> =>
    Store.getStore().persons.findOne({ UUID: root.studentId }),

  activityField: async (root: Grade): Promise<Activity | null> =>
    Store.getStore().activities.findOne({
      final: root.final,
      ...(!root.final && { name: root.name }),
      courseId: root.courseId,
    }),
};
