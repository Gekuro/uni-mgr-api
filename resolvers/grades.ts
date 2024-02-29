"use strict";

import { Filter } from "mongodb";
import { Store } from "../data/store";
import { Grade, GradeInput } from "../types/grade";
import { isGradeInputArrayValid, isGradeInputValid } from "../types/validators";

const invalidGrade = "Non-final grades need to have a name";
const gradeExistsMsg = "Set student already has this grade";
const activityDoesntExistMsg = "Cannot set grade for non-existent activity";
const studentFinalGradeExistsMsg =
  "Student already has final grade for this course";
const gradeOverLimitMsg = "Grade is over set limit";

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
    if (!isGradeInputValid(grade)) throw new Error(invalidGrade);
    await assertGradeDoesntExist(grade);

    if (grade.final && grade.name) delete grade.name;

    const activity = await store.activites.findOne({
      courseId: grade.courseId,
      name: grade.name,
    });
    if (!activity)
      throw new Error(concatGradeDetails(grade, activityDoesntExistMsg));

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

    const assertionPromises: Promise<void>[] = [];
    for (const grade of grades) {
      assertionPromises.push(assertGradeDoesntExist(grade));
      if (grade.final && grade.name) delete grade.name;
    }
    await Promise.all(assertionPromises);

    for (const grade of grades) {
      const activity = await store.activites.findOne({
        courseId: grade.courseId,
        studentId: grade.studentId,
        final: grade.final,
        ...(!grade.final && { name: grade.name }),
      });

      if (!activity)
        throw new Error(concatGradeDetails(grade, activityDoesntExistMsg));
    }

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
};
