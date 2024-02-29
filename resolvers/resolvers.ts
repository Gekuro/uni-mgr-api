"use strict";

import { IResolvers } from "mercurius";

import persons from "./persons";
import courses from "./courses";
import accounts from "./accounts";
import grades from "./grades";
import activites from "./activites";

const resolvers: IResolvers = {
  Query: {
    person: persons.getPerson,
    persons: persons.getPersons,

    course: courses.getCourse,
    courses: courses.getCourses,

    account: accounts.getAccount,
    accounts: accounts.getAccounts,
    self: accounts.getSelf,
    login: accounts.login,

    grades: grades.getGrades,

    courseActivities: activites.getCourseActivities,
  },
  Mutation: {
    addPerson: persons.addPerson,
    addPersons: persons.addPersons,
    updatePerson: persons.updatePerson,

    addCourse: courses.addCourse,
    addCourses: courses.addCourses,
    updateCourse: courses.updateCourse,

    registerAccount: accounts.registerAccount,

    addGrade: grades.addGrade,
    addGrades: grades.addGrades,
    updateGrade: grades.updateGrade,

    addActivity: activites.addActivity,
    addActivities: activites.addActivities,
    updateActivity: activites.updateActivity,
  },
  Person: {
    attending: persons.attendingField,
    lecturing: persons.lecturingField,
    account: persons.accountField,
  },
  Course: {
    lecturer: courses.lecturerField,
    students: courses.studentsField,
  },
  Account: {
    personalData: accounts.personalData,
  },
  Grade: {
    student: grades.studentField,
    activity: grades.activityField,
  },
  Activity: {
    course: activites.courseField,
    grades: activites.gradesField,
  },
};

export default resolvers;
