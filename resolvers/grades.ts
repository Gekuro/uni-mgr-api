"use strict";

import { Filter } from "mongodb";
import { Store } from "../data/store";
import { Grade, GradeInput } from "../types/grade";
import { isGradeInputArrayValid, isGradeInputValid } from "../types/validators";

const finalGradeWithNameMsg =
  "Grade can either be final or it needs to have a name";
const gradeExistsMsg = "Set student already has this grade";
const activityDoesntExistMsg = "Cannot set grade for non-existent activity";
const studentFinalGradeExistsMsg =
  "Student already has final grade for this course";
const gradeOverLimitMsg = "Grade is over set limit";

const concatGradeDetails = (grade: GradeInput | Grade, msg: string): string =>
  msg +
  `. Grade: Student: ${grade.studentId}, Course: ${grade.courseId}, ${
    "final" in grade && grade.final !== null
      ? "Final grade."
      : `Name: ${grade.name}`
  }`;

const assertGradeDoesntExist = async (grade: Grade) => {
  const store = Store.getStore();
  const existingGrade = await store.grades.findOne({
    studentId: grade.studentId,
    courseId: grade.courseId,
    ...("final" in grade ? { final: grade.final } : { name: grade.name }),
  });

  if (!existingGrade) return;
  if ("name" in grade && grade.name !== null)
    throw new Error(concatGradeDetails(grade, gradeExistsMsg));
  throw new Error(concatGradeDetails(grade, studentFinalGradeExistsMsg));
};

export default {
  getGrades: async (
    _: unknown,
    {
      courseId,
      studentId,
      final,
    }: { courseId?: string; studentId?: string; final?: boolean }
  ): Promise<Grade[]> => {
    const store = Store.getStore();
    const filter: Filter<Grade> = {
      ...(courseId && { courseId }),
      ...(studentId && { studentId }),
      ...(final && { final: true }),
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
    if (!isGradeInputValid(grade)) throw new Error(finalGradeWithNameMsg);
    assertGradeDoesntExist(grade);

    if ("name" in grade && grade.name !== null) {
      const activity = await store.gradeActivites.findOne({
        courseId: grade.courseId,
        name: grade.name,
      });
      if (!activity)
        throw new Error(concatGradeDetails(grade, activityDoesntExistMsg));
      if (activity.limit < grade.points)
        throw new Error(concatGradeDetails(grade, gradeOverLimitMsg));
    }

    store.grades.insertOne(grade);
    return grade;
  },

  addGrades: async (
    _: unknown,
    { grades }: { grades: GradeInput[] }
  ): Promise<Grade[]> => {
    const store = Store.getStore();
    if (!isGradeInputArrayValid(grades)) {
      throw new Error(finalGradeWithNameMsg);
    }

    for (const grade of grades) {
      assertGradeDoesntExist(grade);
    }

    for (const grade of grades) {
      if (!("name" in grade) || grade.name !== null) {
        continue;
      }

      const activity = await store.gradeActivites.findOne({
        courseId: grade.courseId,
        name: grade.name,
      });

      if (!activity)
        throw new Error(concatGradeDetails(grade, activityDoesntExistMsg));
      if (activity.limit < grade.points)
        throw new Error(concatGradeDetails(grade, gradeOverLimitMsg));
    }

    store.grades.insertMany(grades);
    return grades;
  },

  // updateGrade(grade: GradeInput!): Grade!
};
